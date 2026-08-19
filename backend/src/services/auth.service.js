const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const AppError = require('../utils/AppError');
const { signToken } = require('../utils/jwt');

function publicUser(user) {
  return { id: user.id, username: user.username, createdAt: user.createdAt };
}

async function login(username, password) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    // Same message for unknown user and wrong password (no user enumeration)
    throw new AppError(401, 'Invalid username or password.', 'INVALID_CREDENTIALS');
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new AppError(401, 'Invalid username or password.', 'INVALID_CREDENTIALS');
  }

  const { token, jti, expiresAt } = signToken(user.id);

  await prisma.authSession.create({
    data: { userId: user.id, tokenJti: jti, expiresAt },
  });

  return { user: publicUser(user), token, expiresAt };
}

async function logout(tokenJti) {
  if (!tokenJti) return;
  await prisma.authSession.updateMany({
    where: { tokenJti },
    data: { revokedAt: new Date() },
  });
}

async function changePassword(userId, currentJti, { currentPassword, username, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'Account not found.', 'USER_NOT_FOUND');

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) throw new AppError(400, 'Current password is incorrect.', 'WRONG_CURRENT_PASSWORD');

  const data = {};
  if (username && username !== user.username) {
    const taken = await prisma.user.findUnique({ where: { username } });
    if (taken) throw new AppError(409, 'This username is already in use.', 'USERNAME_TAKEN');
    data.username = username;
  }
  if (newPassword) {
    data.passwordHash = await bcrypt.hash(newPassword, 12);
  }
  if (Object.keys(data).length === 0) {
    throw new AppError(400, 'Nothing to change.', 'NO_CHANGE');
  }

  await prisma.user.update({ where: { id: user.id }, data });

  // Revoke every other session (the current one stays logged in)
  await prisma.authSession.updateMany({
    where: { tokenJti: { not: currentJti }, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return publicUser({ ...user, ...data });
}

module.exports = { login, logout, changePassword, publicUser };
