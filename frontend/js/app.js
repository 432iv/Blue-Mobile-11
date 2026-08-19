/* ================================================================
   BLUE MOBILE — APPLICATION SCRIPT
   Original single-file vanilla JS POS UI, now backed by the
   Blue Mobile REST API (see js/api.js). All business data lives
   in PostgreSQL; localStorage is used ONLY for the two cosmetic
   preferences (language & theme).
   ================================================================ */

/* ---------------------------------------------------------------
   1. TRANSLATIONS
   --------------------------------------------------------------- */
const I18N = {
  en: {
    brand:"Blue Mobile",
    nav_dashboard:"Dashboard", nav_products:"Products", nav_sales:"Sales", nav_reports:"Reports", nav_customers:"Customers", nav_scanner:"Scanner", nav_settings:"Settings",
    dashboard_subtitle:"Live overview of today's counter activity",
    products_subtitle:"Manage the items your shop sells",
    sales_subtitle:"Record every sale as it happens",
    reports_subtitle:"Browse every closed day",
    settings_subtitle:"Preferences and data controls",
    no_active_day:"No day open",
    day_open_label:"Day open:",
    stat_sales:"Today's Sales", stat_cost:"Today's Cost", stat_profit:"Today's Profit", stat_count:"Number of Sales",
    recent_activity:"Recent Activity", day_status:"Day Status",
    no_recent:"No sales recorded yet today.",
    no_day_dash:"No active day. Start a new day from the Sales page to begin.",
    add_product:"Add Product", search_products:"Search products...",
    field_product_name:"Product Name", ph_product_name:"e.g. Charging Cable",
    cancel:"Cancel", save:"Save", create:"Create", done:"Done",
    no_products_title:"No products yet", no_products_desc:"Add your first product to start recording sales.",
    edit_product:"Edit Product", confirm_delete_product:"Delete this product? This cannot be undone.",
    product_added:"Product added", product_updated:"Product updated", product_deleted:"Product deleted",
    no_day_title:"No day is open yet", no_day_desc:"Start a new day to begin recording sales for your shop.",
    start_new_day:"Start New Day",
    field_day_name:"Day Name", ph_day_name:"e.g. Saturday", field_date:"Date",
    new_sale:"New Sale", field_product:"Product", field_qty:"Quantity", field_cost:"Cost Price",
    field_sell:"Selling Price", field_payment:"Payment Method", field_profit:"Profit",
    pay_cash:"Cash", pay_card:"Bank Card", record_sale:"Record Sale", update_sale:"Update Sale",
    live_summary:"Live Summary", close_day:"Close Day",
    summary_count:"Number of Sales", summary_total:"Total Selling Amount", summary_cost:"Total Cost",
    summary_profit:"Total Profit", summary_cash:"Total Cash Sales", summary_card:"Total Card Sales",
    sales_table_title:"Today's Sales", col_actions:"Actions", col_invoice:"Invoice", field_time:"Time",
    select_product_placeholder:"Select a product",
    no_products_for_sale:"Add a product first from the Products page.",
    close_day_confirm_title:"Close this day?",
    close_day_warning:"This will lock today's session permanently and generate the final report. This cannot be undone.",
    final_report:"Final Report", report_day:"Day", report_date:"Date", report_total_sales:"Total Sales",
    report_total_cost:"Total Cost", report_total_profit:"Total Profit", report_cash:"Cash Sales",
    report_card:"Card Sales", report_count:"Number of Sales",
    day_details:"Day Details", no_reports_title:"No closed days yet",
    no_reports_desc:"Reports appear here once you close a day of sales.",
    settings_language:"Language", settings_language_desc:"Switch between English and Arabic",
    settings_theme:"Theme", settings_theme_desc:"Switch between dark and light mode",
    settings_clear:"Clear All Data", settings_clear_desc:"Permanently erase products, sessions and reports",
    clear_btn:"Clear Data", confirm_clear_data:"This will permanently delete ALL products, sales and reports. Continue?",
    data_cleared:"All data cleared",
    day_started:"Day started successfully", day_closed:"Day closed and report saved",
    sale_added:"Sale recorded", sale_updated:"Sale updated", sale_deleted:"Sale deleted",
    confirm_delete_sale:"Delete this sale?",
    fill_required:"Please fill in all required fields",
    active_day_exists:"A day is already open. Close it before starting a new one.",
    field_category:"Category", field_brand:"Brand", field_stock_qty:"Quantity in Stock",
    field_wholesale:"Wholesale Price", field_image:"Image URL (optional)", field_notes:"Notes (optional)", field_barcode:"Barcode (optional)", field_min_stock:"Minimum Stock Alert",
    ph_brand:"e.g. Samsung", ph_image_url:"https://example.com/image.jpg", ph_notes:"Additional info about this product",
    filter_all_categories:"All Categories", filter_all_brands:"All Brands",
    stat_total_products:"Total Products", stat_total_stock:"Total in Stock",
    stat_low_stock:"Low Stock", stat_inventory_value:"Inventory Value",
    low_stock_warning:"Low stock alert",
    out_of_stock:"Out of Stock", no_stock:"No stock", stock_label:"in stock",
    insufficient_stock:"Insufficient stock available",
    product_saved:"Product saved",
    customers_subtitle:"Manage customers and track debts",
    scanner_subtitle:"Scan barcodes to look up products",
    reports_tab_daily:"Daily Reports", reports_tab_monthly:"Monthly Summary", reports_tab_best:"Best Sellers", reports_tab_lowstock:"Low Stock",
    search_customers:"Search customers...",
    add_customer:"Add Customer", edit_customer:"Edit Customer",
    field_customer_name:"Customer Name", field_customer_phone:"Phone Number",
    confirm_delete_customer:"Delete this customer? This cannot be undone.",
    customer_added:"Customer added", customer_updated:"Customer updated", customer_deleted:"Customer deleted",
    no_customers_title:"No customers yet", no_customers_desc:"Add your first customer to start tracking debts.",
    total_owed:"Total Owed", total_credit:"Total Credit", customer_count:"Customers",
    add_credit:"Add Credit", record_payment:"Record Payment",
    field_amount:"Amount", field_debt_note:"Note",
    credit_added:"Credit added", payment_recorded:"Payment recorded",
    no_debt_history:"No transactions yet.",
    scanner_start:"Start Scanner", scanner_stop:"Stop", scanner_manual:"Manual Entry",
    scanner_hint:"Point camera at a barcode or enter manually",
    barcode_scan_hint:"Point camera at a barcode",
    barcode_number:"Barcode Number", lookup:"Lookup",
    barcode_not_found:"No product found with this barcode",
    barcode_scanned:"Product found",
    monthly_summary_title:"Monthly Summary",
    best_sellers_title:"Best Sellers",
    low_stock_report_title:"Low Stock Report",
    month_label:"Month", total_sales_label:"Total Sales", total_profit_label:"Total Profit",
    times_sold:"times sold", units_sold:"units sold", report_total_products:"Total Products",
    /* ---- auth / account ---- */
    login_title:"Welcome back", login_subtitle:"Sign in to your Blue Mobile POS",
    login_username:"Username", login_password:"Password", login_btn:"Sign In",
    login_meta:"Secure admin access · Blue Mobile POS",
    login_failed:"Invalid username or password",
    logout:"Log Out", logout_desc:"End this session on this device",
    logged_out:"You have been signed out",
    session_expired:"Your session has expired. Please sign in again.",
    settings_account:"Account", signed_in_as:"Signed in as",
    change_password:"Change Password", change_password_desc:"Update your username or password",
    current_password:"Current Password", new_username:"New Username",
    new_password:"New Password (min 8 characters)", confirm_password:"Confirm New Password",
    password_changed:"Account updated successfully",
    password_mismatch:"Passwords do not match",
    password_too_short:"New password must be at least 8 characters",
    offline_title:"Cannot reach the server",
    offline_desc:"The Blue Mobile backend is offline. Check that the server is running, then retry.",
    retry:"Retry", loading:"Loading...",
    save_failed:"Something went wrong. Please try again.",
    scanner_unavailable:"Barcode scanner library could not be loaded. Check your internet connection.",
    /* ---- sales search / manual items ---- */
    search_product:"Product or Service",
    search_product_ph:"Search product or type a service...",
    search_product_hint:"Start typing to search products, or type a service name",
    service:"Service",
    add_manual:"Add as service item",
    manual_hint:"Manual item — no inventory, not deducted from stock",
    select_product_first:"Select a product or type a service first",
    manual_price_required:"Enter a selling price for the service item",
    field_description:"Description / Specifications",
    ph_description:"e.g. Type-C → iPhone, fast charging",
    field_wattage:"Wattage",
    field_connector:"Connector / Type",
    field_model:"Compatible Phone Model",
    model_ph:"Search phone model (Apple, Samsung, ...)",
    model_required:"Select or add a compatible phone model",
    add_model_hint:"Add new model...",
    model_added:"Phone model added",
    /* ---- purchases ---- */
    purchase:"Purchase",
    purchase_title:"New Purchase",
    purchase_hint:"Add stock to this product. A new purchase batch is created internally — no duplicate product.",
    purchase_price:"Purchase Price",
    stock_added:"Stock added (new purchase batch)",
    /* ---- inventory ---- */
    inventory_active:"Active inventory",
    out_of_stock_count:"out of stock",
    show_out_of_stock:"Show out of stock",
    hide_out_of_stock:"Hide out of stock",
    /* ---- daily notes ---- */
    daily_notes:"Daily Notes",
    add_note:"Add Note",
    note_placeholder:"e.g. Gave my brother 100 LYD",
    no_notes:"No notes for today yet.",
    note_added:"Note added",
    note_deleted:"Note deleted",
    delete_note_confirm:"Delete this note?",
    /* ---- product types ---- */
    type_chargers:"Chargers", type_cables:"Cables", type_cases:"Phone Cases",
    type_protectors:"Screen Protectors", type_bt_earphones:"Bluetooth Earphones",
    type_wired_earphones:"Wired Earphones", type_aux:"AUX Cables",
    type_adapters:"Adapters & Connectors", type_powerbanks:"Power Banks",
    type_phones:"Phones", type_other:"Other Accessories",
    reports_error:"Could not load reports. Please try again."
  },
  ar: {
    brand:"بلو موبايل",
    nav_dashboard:"الرئيسية", nav_products:"المنتجات", nav_sales:"المبيعات", nav_reports:"التقارير", nav_customers:"العملاء", nav_scanner:"الماسح", nav_settings:"الإعدادات",
    dashboard_subtitle:"نظرة عامة مباشرة على نشاط المحل اليوم",
    products_subtitle:"إدارة المنتجات التي يبيعها متجرك",
    sales_subtitle:"سجّل كل عملية بيع فور حدوثها",
    reports_subtitle:"تصفح جميع الأيام المغلقة",
    settings_subtitle:"التفضيلات وإعدادات البيانات",
    no_active_day:"لا يوجد يوم مفتوح",
    day_open_label:"اليوم المفتوح:",
    stat_sales:"مبيعات اليوم", stat_cost:"تكلفة اليوم", stat_profit:"ربح اليوم", stat_count:"عدد المبيعات",
    recent_activity:"النشاط الأخير", day_status:"حالة اليوم",
    no_recent:"لا توجد مبيعات مسجلة اليوم بعد.",
    no_day_dash:"لا يوجد يوم نشط. ابدأ يومًا جديدًا من صفحة المبيعات للبدء.",
    add_product:"إضافة منتج", search_products:"ابحث عن منتج...",
    field_product_name:"اسم المنتج", ph_product_name:"مثال: كابل شحن",
    cancel:"إلغاء", save:"حفظ", create:"إنشاء", done:"تم",
    no_products_title:"لا توجد منتجات بعد", no_products_desc:"أضف أول منتج لبدء تسجيل المبيعات.",
    edit_product:"تعديل المنتج", confirm_delete_product:"حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.",
    product_added:"تمت إضافة المنتج", product_updated:"تم تحديث المنتج", product_deleted:"تم حذف المنتج",
    no_day_title:"لم يبدأ اليوم بعد", no_day_desc:"ابدأ يومًا جديدًا لبدء تسجيل مبيعات متجرك.",
    start_new_day:"بدء يوم جديد",
    field_day_name:"اسم اليوم", ph_day_name:"مثال: السبت", field_date:"التاريخ",
    new_sale:"عملية بيع جديدة", field_product:"المنتج", field_qty:"الكمية", field_cost:"سعر التكلفة",
    field_sell:"سعر البيع", field_payment:"طريقة الدفع", field_profit:"الربح",
    pay_cash:"نقدًا", pay_card:"بطاقة بنكية", record_sale:"تسجيل البيع", update_sale:"تحديث البيع",
    live_summary:"ملخص مباشر", close_day:"إغلاق اليوم",
    summary_count:"عدد المبيعات", summary_total:"إجمالي مبلغ البيع", summary_cost:"إجمالي التكلفة",
    summary_profit:"إجمالي الربح", summary_cash:"إجمالي المبيعات النقدية", summary_card:"إجمالي مبيعات البطاقة",
    sales_table_title:"مبيعات اليوم", col_actions:"إجراءات", col_invoice:"الفاتورة", field_time:"الوقت",
    select_product_placeholder:"اختر منتجًا",
    no_products_for_sale:"أضف منتجًا أولاً من صفحة المنتجات.",
    close_day_confirm_title:"هل تريد إغلاق هذا اليوم؟",
    close_day_warning:"سيؤدي هذا إلى قفل جلسة اليوم بشكل دائم وإنشاء التقرير النهائي. لا يمكن التراجع عن هذا.",
    final_report:"التقرير النهائي", report_day:"اليوم", report_date:"التاريخ", report_total_sales:"إجمالي المبيعات",
    report_total_cost:"إجمالي التكلفة", report_total_profit:"إجمالي الربح", report_cash:"مبيعات نقدية",
    report_card:"مبيعات بالبطاقة", report_count:"عدد المبيعات",
    day_details:"تفاصيل اليوم", no_reports_title:"لا توجد أيام مغلقة بعد",
    no_reports_desc:"تظهر التقارير هنا بعد إغلاق يوم من المبيعات.",
    settings_language:"اللغة", settings_language_desc:"التبديل بين الإنجليزية والعربية",
    settings_theme:"المظهر", settings_theme_desc:"التبديل بين الوضع الداكن والفاتح",
    settings_clear:"مسح جميع البيانات", settings_clear_desc:"حذف المنتجات والجلسات والتقارير بشكل دائم",
    clear_btn:"مسح البيانات", confirm_clear_data:"سيؤدي هذا إلى حذف جميع المنتجات والمبيعات والتقارير نهائيًا. متابعة؟",
    data_cleared:"تم مسح جميع البيانات",
    day_started:"تم بدء اليوم بنجاح", day_closed:"تم إغلاق اليوم وحفظ التقرير",
    sale_added:"تم تسجيل البيع", sale_updated:"تم تحديث البيع", sale_deleted:"تم حذف البيع",
    confirm_delete_sale:"حذف عملية البيع هذه؟",
    fill_required:"يرجى ملء جميع الحقول المطلوبة",
    active_day_exists:"يوجد يوم مفتوح بالفعل. أغلقه قبل بدء يوم جديد.",
    field_category:"الفئة", field_brand:"العلامة التجارية", field_stock_qty:"الكمية المتوفرة",
    field_wholesale:"سعر الجملة", field_image:"رابط الصورة (اختياري)", field_notes:"ملاحظات (اختياري)", field_barcode:"الباركود (اختياري)", field_min_stock:"الحد الأدنى للمخزون",
    ph_brand:"مثال: Samsung", ph_image_url:"https://example.com/image.jpg", ph_notes:"معلومات إضافية عن المنتج",
    filter_all_categories:"جميع الفئات", filter_all_brands:"جميع العلامات",
    stat_total_products:"إجمالي المنتجات", stat_total_stock:"إجمالي المخزون",
    stat_low_stock:"مخزون منخفض", stat_inventory_value:"قيمة المخزون",
    low_stock_warning:"تنبيه: مخزون منخفض",
    out_of_stock:"نفذ من المخزون", no_stock:"لا مخزون", stock_label:"متوفر",
    insufficient_stock:"المخزون غير كافٍ",
    product_saved:"تم حفظ المنتج",
    customers_subtitle:"إدارة العملاء وتتبع الديون",
    scanner_subtitle:"مسح الباركود للبحث عن المنتجات",
    reports_tab_daily:"التقارير اليومية", reports_tab_monthly:"الملخص الشهري", reports_tab_best:"الأكثر مبيعاً", reports_tab_lowstock:"المخزون المنخفض",
    search_customers:"ابحث عن عميل...",
    add_customer:"إضافة عميل", edit_customer:"تعديل العميل",
    field_customer_name:"اسم العميل", field_customer_phone:"رقم الهاتف",
    confirm_delete_customer:"حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.",
    customer_added:"تمت إضافة العميل", customer_updated:"تم تحديث العميل", customer_deleted:"تم حذف العميل",
    no_customers_title:"لا يوجد عملاء بعد", no_customers_desc:"أضف أول عميل لتتبع الديون.",
    total_owed:"إجمالي المديونية", total_credit:"إجمالي الائتمان", customer_count:"العملاء",
    add_credit:"إضافة ائتمان", record_payment:"تسجيل دفعة",
    field_amount:"المبلغ", field_debt_note:"ملاحظة",
    credit_added:"تمت إضافة الائتمان", payment_recorded:"تم تسجيل الدفعة",
    no_debt_history:"لا توجد معاملات بعد.",
    scanner_start:"بدء الماسح", scanner_stop:"إيقاف", scanner_manual:"إدخال يدوي",
    scanner_hint:"وجّه الكاميرا نحو الباركود أو أدخل يدوياً",
    barcode_scan_hint:"وجّه الكاميرا نحو الباركود",
    barcode_number:"رقم الباركود", lookup:"بحث",
    barcode_not_found:"لم يتم العثور على منتج بهذا الباركود",
    barcode_scanned:"تم العثور على المنتج",
    monthly_summary_title:"الملخص الشهري",
    best_sellers_title:"الأكثر مبيعاً",
    low_stock_report_title:"تقرير المخزون المنخفض",
    month_label:"الشهر", total_sales_label:"إجمالي المبيعات", total_profit_label:"إجمالي الربح",
    times_sold:"مرة بيع", units_sold:"وحدة مباعة", report_total_products:"إجمالي المنتجات",
    /* ---- auth / account ---- */
    login_title:"مرحبًا بعودتك", login_subtitle:"سجّل الدخول إلى نظام بلو موبايل",
    login_username:"اسم المستخدم", login_password:"كلمة المرور", login_btn:"تسجيل الدخول",
    login_meta:"دخول إداري آمن · نظام بلو موبايل",
    login_failed:"اسم المستخدم أو كلمة المرور غير صحيحين",
    logout:"تسجيل الخروج", logout_desc:"إنهاء هذه الجلسة على هذا الجهاز",
    logged_out:"تم تسجيل خروجك",
    session_expired:"انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.",
    settings_account:"الحساب", signed_in_as:"مسجّل الدخول باسم",
    change_password:"تغيير كلمة المرور", change_password_desc:"تحديث اسم المستخدم أو كلمة المرور",
    current_password:"كلمة المرور الحالية", new_username:"اسم المستخدم الجديد",
    new_password:"كلمة المرور الجديدة (8 أحرف على الأقل)", confirm_password:"تأكيد كلمة المرور الجديدة",
    password_changed:"تم تحديث الحساب بنجاح",
    password_mismatch:"كلمتا المرور غير متطابقتين",
    password_too_short:"يجب ألا تقل كلمة المرور الجديدة عن 8 أحرف",
    offline_title:"تعذر الوصول إلى الخادم",
    offline_desc:"خادم بلو موبايل غير متصل. تأكد من أن الخادم يعمل ثم أعد المحاولة.",
    retry:"إعادة المحاولة", loading:"جارٍ التحميل...",
    save_failed:"حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    scanner_unavailable:"تعذر تحميل مكتبة الماسح الضوئي. تحقق من اتصال الإنترنت.",
    /* ---- sales search / manual items ---- */
    search_product:"المنتج أو الخدمة",
    search_product_ph:"ابحث عن منتج أو اكتب اسم خدمة...",
    search_product_hint:"ابدأ الكتابة للبحث عن المنتجات، أو اكتب اسم خدمة",
    service:"خدمة",
    add_manual:"إضافة كعنصر خدمة",
    manual_hint:"عنصر يدوي — بدون مخزون، لا يُخصم من الكمية",
    select_product_first:"اختر منتجًا أو اكتب اسم خدمة أولاً",
    manual_price_required:"أدخل سعر بيع للعنصر اليدوي",
    field_description:"الوصف / المواصفات",
    ph_description:"مثال: Type-C ← iPhone، شحن سريع",
    field_wattage:"القدرة (واط)",
    field_connector:"الموصل / النوع",
    field_model:"الطراز المتوافق",
    model_ph:"ابحث عن طراز الهاتف (Apple, Samsung, ...)",
    model_required:"اختر أو أضف طراز هاتف متوافق",
    add_model_hint:"إضافة طراز جديد...",
    model_added:"تمت إضافة طراز الهاتف",
    /* ---- purchases ---- */
    purchase:"شراء",
    purchase_title:"شراء جديد",
    purchase_hint:"إضافة كمية لهذا المنتج. يتم إنشاء دفعة شراء داخلية — بدون تكرار المنتج.",
    purchase_price:"سعر الشراء",
    stock_added:"تمت إضافة الكمية (دفعة شراء جديدة)",
    /* ---- inventory ---- */
    inventory_active:"المخزون النشط",
    out_of_stock_count:"نفذ من المخزون",
    show_out_of_stock:"عرض النافذ من المخزون",
    hide_out_of_stock:"إخفاء النافذ من المخزون",
    /* ---- daily notes ---- */
    daily_notes:"ملاحظات اليوم",
    add_note:"إضافة ملاحظة",
    note_placeholder:"مثال: أعطيت أخي 100 دينار",
    no_notes:"لا توجد ملاحظات اليوم بعد.",
    note_added:"تمت إضافة الملاحظة",
    note_deleted:"تم حذف الملاحظة",
    delete_note_confirm:"حذف هذه الملاحظة؟",
    /* ---- product types ---- */
    type_chargers:"شواحن", type_cables:"كابلات", type_cases:"أغطية هواتف",
    type_protectors:"حمايات شاشة", type_bt_earphones:"سماعات بلوتوث",
    type_wired_earphones:"سماعات سلكية", type_aux:"كابلات AUX",
    type_adapters:"محولات ووصلات", type_powerbanks:"باور بانك",
    type_phones:"هواتف", type_other:"إكسسوارات أخرى",
    reports_error:"تعذر تحميل التقارير. يرجى المحاولة مرة أخرى."
  }
};

/* ---------------------------------------------------------------
   2. STATE — business data now lives on the server; only the two
   cosmetic preferences (lang / theme) remain in localStorage.
   --------------------------------------------------------------- */
const STORAGE_KEYS = {
  theme:"pos_theme",
  lang:"pos_lang"
};

let state = {
  lang: localStorage.getItem(STORAGE_KEYS.lang) || "en",
  theme: localStorage.getItem(STORAGE_KEYS.theme) || "dark",
  authed: false,
  user: null,
  products: [],           // ACTIVE inventory (quantity > 0) — used in sales search
  outOfStock: [],         // zero-stock products (kept, never lost, not for sale)
  showOutOfStock: false,
  deviceModels: [],       // cached phone/device models for the product form
  session: null,          // open day session; .sales attached after load
  notes: [],              // daily notes of the open day
  reports: [],            // closed days with totals
  reportsData: {},        // lazy-loaded report tabs: monthly / bestSellers / lowStock
  customers: [],
  customerSummary: { count:0, totalOwed:0, totalCredit:0 },
  dashboard: null,
  productFilter: "",
  paymentMethod: "cash",
  saleSelected: null      // {type:'product', product} | {type:'manual', text}
};

/* ---------------------------------------------------------------
   3. DATA LOADING + SCREEN CONTROL + ERROR HANDLING
   --------------------------------------------------------------- */
async function loadData(){
  const session = await API.getCurrentSession();
  state.session = session;
  if(session){
    const [sales, notes] = await Promise.all([
      API.getSales(session.id),
      API.getNotes(session.id)
    ]);
    session.sales = sales; // same shape the original UI expects
    state.notes = notes;
  } else {
    state.notes = [];
  }

  const [prodData, reports, customers, dash] = await Promise.all([
    API.getProducts(true), // include out-of-stock partition
    API.getReports(),
    API.getCustomers(),
    API.getDashboard()
  ]);

  state.products = prodData.products;
  state.outOfStock = prodData.outOfStock || [];
  state.reports = reports;
  state.customers = customers.customers;
  state.customerSummary = customers.summary || { count:0, totalOwed:0, totalCredit:0 };
  state.dashboard = dash;
  state.reportsData = {}; // server-backed report tabs will refetch
}

async function refreshAll(){
  setLoading(true);
  try {
    await loadData();
  } catch(err){
    handleApiError(err);
    return;
  } finally {
    setLoading(false);
  }
  renderAll();
}

function handleApiError(err){
  if(!err) return;
  if(err.status === 401) return; // already handled by API.onUnauthorized
  if(err.status === 0){ showToast(err.message, "error"); return; }
  showToast(err.message || t("save_failed"), "error");
}

function setLoading(on){
  const el = document.getElementById("app-loading");
  if(el) el.classList.toggle("active", !!on);
}

function showLogin(){
  document.getElementById("app").style.display = "none";
  document.getElementById("offline-screen").classList.remove("active");
  document.getElementById("login-screen").classList.add("active");
  document.getElementById("login-error").classList.remove("active");
  document.getElementById("login-password").value = "";
  setTimeout(()=> document.getElementById("login-username").focus(), 80);
}

function showOffline(){
  document.getElementById("app").style.display = "none";
  document.getElementById("login-screen").classList.remove("active");
  document.getElementById("offline-screen").classList.add("active");
}

function showApp(){
  document.getElementById("login-screen").classList.remove("active");
  document.getElementById("offline-screen").classList.remove("active");
  document.getElementById("app").style.display = "flex";
}

/* ---------------------------------------------------------------
   4. I18N + THEME APPLICATION
   --------------------------------------------------------------- */
function t(key){ return (I18N[state.lang] && I18N[state.lang][key]) || key; }

function applyLanguage(lang){
  state.lang = lang;
  localStorage.setItem(STORAGE_KEYS.lang, lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.body.classList.toggle("lang-ar", lang === "ar");

  document.querySelectorAll("[data-i18n]").forEach(el=>{
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });
  document.querySelectorAll(".lang-toggle-btns button").forEach(b=>{
    b.classList.toggle("active", b.getAttribute("data-lang") === lang);
  });

  updatePageHeader();
  updateAccountRow();
  if(state.authed) renderAll();
}

function applyTheme(theme){
  state.theme = theme;
  localStorage.setItem(STORAGE_KEYS.theme, theme);
  document.documentElement.setAttribute("data-theme", theme);
  const sw = document.getElementById("theme-switch");
  if(sw) sw.classList.toggle("on", theme === "light");
  const icon = document.getElementById("theme-icon");
  if(icon){
    icon.innerHTML = theme === "dark"
      ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
      : '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
  }
}

function updateAccountRow(){
  const el = document.getElementById("account-username");
  if(el) el.textContent = t("signed_in_as") + ": " + (state.user ? state.user.username : "");
}

/* ---------------------------------------------------------------
   5. NAVIGATION
   --------------------------------------------------------------- */
const PAGE_TITLES = {
  dashboard:{ title:"nav_dashboard", sub:"dashboard_subtitle" },
  products:{ title:"nav_products", sub:"products_subtitle" },
  sales:{ title:"nav_sales", sub:"sales_subtitle" },
  reports:{ title:"nav_reports", sub:"reports_subtitle" },
  customers:{ title:"nav_customers", sub:"customers_subtitle" },
  scanner:{ title:"nav_scanner", sub:"scanner_subtitle" },
  settings:{ title:"nav_settings", sub:"settings_subtitle" }
};
let currentSection = "dashboard";

function showSection(name){
  if(currentSection === "scanner" && name !== "scanner") stopPageScanner();
  currentSection = name;
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById("section-"+name).classList.add("active");
  document.querySelectorAll(".nav-item").forEach(n => n.classList.toggle("active", n.getAttribute("data-nav") === name));
  updatePageHeader();
  renderAll();
  window.scrollTo({top:0, behavior:"smooth"});
}

function updatePageHeader(){
  const conf = PAGE_TITLES[currentSection];
  document.getElementById("page-title").textContent = t(conf.title);
  document.getElementById("page-subtitle").textContent = t(conf.sub);
}

document.querySelectorAll(".nav-item").forEach(btn=>{
  btn.addEventListener("click", ()=> showSection(btn.getAttribute("data-nav")));
});

/* ---------------------------------------------------------------
   6. TOASTS
   --------------------------------------------------------------- */
function showToast(message, type="success"){
  const stack = document.getElementById("toast-stack");
  const toast = document.createElement("div");
  toast.className = "toast " + type;
  const icons = {
    success:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
    error:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
    info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
  };
  toast.innerHTML = icons[type] + "<span>"+message+"</span>";
  stack.appendChild(toast);
  setTimeout(()=> toast.remove(), 3000);
}

/* ---------------------------------------------------------------
   7. MODAL HELPERS
   --------------------------------------------------------------- */
function openModal(id){ document.getElementById(id).classList.add("active"); }
function closeModal(id){
  document.getElementById(id).classList.remove("active");
  if(id === "modal-product") stopProductBarcodeScan();
  if(id === "modal-manual-barcode") document.getElementById("manual-barcode-input").value = "";
}
document.querySelectorAll("[data-close]").forEach(btn=>{
  btn.addEventListener("click", ()=> closeModal(btn.getAttribute("data-close")));
});
document.querySelectorAll(".modal-overlay").forEach(overlay=>{
  overlay.addEventListener("click", (e)=>{ if(e.target === overlay) overlay.classList.remove("active"); });
});

/* ---------------------------------------------------------------
   8. NUMBER FORMATTING
   --------------------------------------------------------------- */
function fmt(n){ return (Math.round((Number(n)||0) * 100) / 100).toFixed(2); }

/* ---------------------------------------------------------------
   9. RENDER: DASHBOARD  (data comes from GET /api/dashboard/summary)
   --------------------------------------------------------------- */
function renderDashboard(){
  const d = state.dashboard || {
    today:{ sales:0, cost:0, profit:0, count:0, cash:0, card:0 },
    products:{ totalProducts:0, totalStock:0, lowStock:0, inventoryValue:0 },
    session:null,
    recent:[]
  };

  document.getElementById("stat-sales").textContent = fmt(d.today.sales);
  document.getElementById("stat-cost").textContent = fmt(d.today.cost);
  document.getElementById("stat-profit").textContent = fmt(d.today.profit);
  document.getElementById("stat-count").textContent = d.today.count;

  document.getElementById("stat-total-products").textContent = d.products.totalProducts;
  document.getElementById("stat-total-stock").textContent = d.products.totalStock;
  document.getElementById("stat-low-stock").textContent = d.products.lowStock;
  document.getElementById("stat-inventory-value").textContent = fmt(d.products.inventoryValue);

  const recentEl = document.getElementById("dash-recent");
  if(!d.recent || d.recent.length === 0){
    recentEl.innerHTML = `<div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3h2l2.4 12.4a2 2 0 002 1.6h8.2a2 2 0 002-1.6L21 7H6"/></svg>
      <strong>${t("no_recent")}</strong>
    </div>`;
  } else {
    recentEl.innerHTML = d.recent.map(r => `
      <div class="receipt-row">
        <span>${escapeHtml(r.productName)} × ${r.quantity}</span>
        <span class="amt">${fmt(r.amount)}</span>
      </div>`).join("");
  }

  const statusEl = document.getElementById("dash-day-status");
  if(d.session){
    statusEl.innerHTML = `
      <div class="receipt-row"><span>${t("field_day_name")}</span><span class="amt">${escapeHtml(d.session.dayName)}</span></div>
      <div class="receipt-row"><span>${t("field_date")}</span><span class="amt">${escapeHtml(d.session.date)}</span></div>
      <div class="receipt-row"><span>${t("summary_cash")}</span><span class="amt">${fmt(d.today.cash)}</span></div>
      <div class="receipt-row"><span>${t("summary_card")}</span><span class="amt">${fmt(d.today.card)}</span></div>`;
  } else {
    statusEl.innerHTML = `<div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
      <strong>${t("no_day_dash")}</strong>
    </div>`;
  }

  updateSessionPill();
}

function updateSessionPill(){
  const pill = document.getElementById("session-pill");
  const text = document.getElementById("session-pill-text");
  if(state.session){
    pill.classList.add("live");
    text.innerHTML = `${escapeHtml(state.session.dayName)} · <strong>${escapeHtml(state.session.date)}</strong>`;
  } else {
    pill.classList.remove("live");
    text.textContent = t("no_active_day");
  }
}

/* ---------------------------------------------------------------
   10. PRODUCTS  (persisted via /api/products)
   --------------------------------------------------------------- */
function stockClass(qty){
  if(qty <= 0) return "out";
  return "ok";
}

function isLowStock(p){
  const q = p.quantity || 0;
  const min = p.minimumStock !== undefined ? p.minimumStock : 5;
  return q > 0 && q <= min;
}

function stockClassWithProduct(p){
  const q = p.quantity || 0;
  if(q <= 0) return "out";
  if(isLowStock(p)) return "low";
  return "ok";
}

function productDisplayName(p){
  // identity text: name + brand + specs/description
  const parts = [p.name];
  if(p.brand) parts.push(p.brand);
  return parts.join(" — ");
}

function productDescriptionText(p){
  const parts = [];
  if(p.description) parts.push(p.description);
  if(p.wattage) parts.push(p.wattage);
  if(p.connectorType) parts.push(p.connectorType);
  if(p.compatibleModelName) parts.push(p.compatibleModelName);
  return parts.join(" · ");
}

function updateProductFilters(){
  const catSelect = document.getElementById("category-filter");
  const brandSelect = document.getElementById("brand-filter");
  const all = state.showOutOfStock ? [...state.products, ...state.outOfStock] : state.products;
  const categories = [...new Set(all.map(p => p.category).filter(Boolean))].sort();
  const brands = [...new Set(all.map(p => p.brand).filter(Boolean))].sort();
  const curCat = catSelect.value;
  const curBrand = brandSelect.value;
  catSelect.innerHTML = `<option value="">${t("filter_all_categories")}</option>` + categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
  brandSelect.innerHTML = `<option value="">${t("filter_all_brands")}</option>` + brands.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join("");
  if(curCat) catSelect.value = curCat;
  if(curBrand) brandSelect.value = curBrand;
}

function renderLowStockAlerts(){
  const el = document.getElementById("low-stock-alerts");
  const low = state.products.filter(p => isLowStock(p));
  if(low.length === 0){ el.innerHTML = ""; return; }
  el.innerHTML = `<div class="low-stock-alert">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
    <span>${t("low_stock_warning")}: ${low.map(p => escapeHtml(p.name) + " (" + p.quantity + ")").join(", ")}</span>
  </div>`;
}

function renderProducts(){
  updateProductFilters();
  renderLowStockAlerts();
  const grid = document.getElementById("product-grid");
  const filter = state.productFilter.trim().toLowerCase();
  const catFilter = document.getElementById("category-filter").value;
  const brandFilter = document.getElementById("brand-filter").value;

  // active inventory by default; out-of-stock only when the toggle is on
  const all = state.showOutOfStock ? [...state.products, ...state.outOfStock] : state.products;
  let list = all.filter(p => p.name.toLowerCase().includes(filter) || (p.description||"").toLowerCase().includes(filter) || (p.brand||"").toLowerCase().includes(filter));
  if(catFilter) list = list.filter(p => p.category === catFilter);
  if(brandFilter) list = list.filter(p => p.brand === brandFilter);

  // out-of-stock toggle row
  const toggleRow = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
    <span style="font-size:.8rem; color:var(--text-muted);">${t("inventory_active")}: <strong class="mono">${state.products.length}</strong> ${state.outOfStock.length > 0 ? `· ${t("out_of_stock_count")}: <strong class="mono" style="color:var(--accent-rose)">${state.outOfStock.length}</strong>` : ""}</span>
    <button class="btn btn-ghost" id="toggle-out-btn" style="padding:8px 14px; font-size:.8rem;">
      ${state.showOutOfStock ? t("hide_out_of_stock") : t("show_out_of_stock")}
    </button>
  </div>`;

  if(list.length === 0){
    grid.innerHTML = toggleRow + `<div class="empty-state" style="grid-column:1/-1;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/></svg>
      <strong>${t("no_products_title")}</strong>
      <span>${t("no_products_desc")}</span>
    </div>`;
    const tb = document.getElementById("toggle-out-btn");
    if(tb) tb.addEventListener("click", ()=>{ state.showOutOfStock = !state.showOutOfStock; renderProducts(); });
    return;
  }

  grid.innerHTML = toggleRow + list.map(p => {
    const qty = p.quantity || 0;
    const desc = productDescriptionText(p);
    const imgHtml = p.imageUrl
      ? `<img class="product-img" src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.name)}">`
      : `<span class="product-img-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/></svg></span>`;
    return `<div class="glass-card product-card" data-id="${p.id}">
      ${imgHtml}
      <div class="p-meta">
        <span class="p-name">${escapeHtml(p.name)}</span>
        <span class="p-category">${escapeHtml(p.category || "")}</span>
        ${p.brand ? `<span class="p-brand">${escapeHtml(p.brand)}</span>` : ""}
        ${desc ? `<span class="p-desc">${escapeHtml(desc)}</span>` : ""}
        <div class="p-stock"><span class="stock-badge ${stockClassWithProduct(p)}">${qty} ${t("stock_label")}</span></div>
        <div class="p-prices">
          <span class="p-price">${fmt(p.buyingPrice)}</span>
          <span class="p-price" style="color:var(--accent-cyan)">${fmt(p.sellingPrice)}</span>
        </div>
      </div>
      <span class="p-actions">
        <button class="purchase-product-btn" data-id="${p.id}" title="${t("purchase")}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M12 5v14M5 12h14"/></svg></button>
        <button class="edit-product-btn" data-id="${p.id}" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg></button>
        <button class="delete-product-btn" data-id="${p.id}" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>
      </span>
    </div>`;
  }).join("");

  const tb = document.getElementById("toggle-out-btn");
  if(tb) tb.addEventListener("click", ()=>{ state.showOutOfStock = !state.showOutOfStock; renderProducts(); });
  grid.querySelectorAll(".purchase-product-btn").forEach(b => b.addEventListener("click", ()=> openPurchaseModal(b.getAttribute("data-id"))));
  grid.querySelectorAll(".edit-product-btn").forEach(b => b.addEventListener("click", ()=> openProductModal("edit", b.getAttribute("data-id"))));
  grid.querySelectorAll(".delete-product-btn").forEach(b => b.addEventListener("click", ()=> deleteProduct(b.getAttribute("data-id"))));

  // CSP-safe fallback when a product image fails to load
  grid.querySelectorAll("img.product-img").forEach(img => {
    img.addEventListener("error", () => {
      const ph = document.createElement("span");
      ph.className = "product-img-placeholder";
      ph.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/></svg>';
      img.replaceWith(ph);
    });
  });
}

/* ---- product form: type-specific fields + phone model combobox ---- */
const MODEL_REQUIRED_TYPES = ["Phone Cases", "Screen Protectors"];
const WATTAGE_TYPES = ["Chargers"];
const CONNECTOR_TYPES = ["Cables", "AUX Cables", "Adapters & Connectors"];
const BRAND_HIDDEN_TYPES = ["Phone Cases", "Screen Protectors", "Other Accessories"];

function syncProductTypeFields(){
  const cat = document.getElementById("product-category-input").value;
  document.getElementById("field-product-brand").style.display = BRAND_HIDDEN_TYPES.includes(cat) ? "none" : "";
  document.getElementById("field-product-wattage").style.display = WATTAGE_TYPES.includes(cat) ? "" : "none";
  document.getElementById("field-product-connector").style.display = CONNECTOR_TYPES.includes(cat) ? "" : "none";
  const needsModel = MODEL_REQUIRED_TYPES.includes(cat);
  document.getElementById("field-product-model").style.display = needsModel ? "" : "none";
}

async function loadDeviceModels(search){
  try {
    state.deviceModels = await API.getDeviceModels(search || "");
  } catch(err){ /* non-fatal */ }
}

function renderModelList(filterText){
  const listEl = document.getElementById("product-model-list");
  const text = (filterText || "").trim().toLowerCase();
  const matches = state.deviceModels.filter(m =>
    !text || m.brand.toLowerCase().includes(text) || m.model.toLowerCase().includes(text)
  ).slice(0, 30);

  const items = matches.map(m => `<div class="combobox-item" data-model-id="${m.id}">
    <div class="ci-name">${escapeHtml(m.brand)} ${escapeHtml(m.model)}</div>
  </div>`).join("");

  listEl.innerHTML = items + `<div class="combobox-item manual" data-model-new>
    <div class="ci-name">＋ <span data-i18n="add_model_hint">Add new model...</span></div>
  </div>`;
  listEl.classList.add("open");

  listEl.querySelectorAll("[data-model-id]").forEach(el => {
    el.addEventListener("click", () => {
      document.getElementById("product-model-id").value = el.getAttribute("data-model-id");
      document.getElementById("product-model-search").value = el.querySelector(".ci-name").textContent.trim();
      listEl.classList.remove("open");
    });
  });
  listEl.querySelector("[data-model-new]").addEventListener("click", () => {
    document.getElementById("product-model-add-row").style.display = "flex";
    listEl.classList.remove("open");
  });
}

document.getElementById("product-model-search").addEventListener("input", function(){
  renderModelList(this.value);
});
document.getElementById("product-model-search").addEventListener("focus", () => renderModelList(document.getElementById("product-model-search").value));
document.getElementById("product-model-search").addEventListener("blur", () => {
  setTimeout(()=> document.getElementById("product-model-list").classList.remove("open"), 200);
});
document.getElementById("product-model-save").addEventListener("click", async () => {
  const brand = document.getElementById("product-model-brand").value.trim();
  const model = document.getElementById("product-model-name").value.trim();
  if(!model){ showToast(t("fill_required"), "error"); return; }
  try {
    const created = await API.createDeviceModel({ brand, model });
    await loadDeviceModels("");
    document.getElementById("product-model-id").value = created.id;
    document.getElementById("product-model-search").value = brand + " " + model;
    document.getElementById("product-model-add-row").style.display = "none";
    document.getElementById("product-model-name").value = "";
    showToast(t("model_added"));
  } catch(err){ handleApiError(err); }
});

/* ---- purchase / restock modal ---- */
function openPurchaseModal(id){
  const p = state.products.find(x => x.id === id) || state.outOfStock.find(x => x.id === id);
  if(!p) return;
  document.getElementById("purchase-product-id").value = p.id;
  document.getElementById("purchase-product-name").textContent = productDisplayName(p);
  document.getElementById("purchase-qty").value = 1;
  document.getElementById("purchase-cost").value = p.buyingPrice || "";
  openModal("modal-purchase");
}

document.getElementById("purchase-form").addEventListener("submit", async function(e){
  e.preventDefault();
  const id = document.getElementById("purchase-product-id").value;
  const quantity = parseInt(document.getElementById("purchase-qty").value, 10);
  const unitCost = parseFloat(document.getElementById("purchase-cost").value);
  if(!id || !quantity || quantity < 1 || isNaN(unitCost) || unitCost < 0){
    showToast(t("fill_required"), "error"); return;
  }
  try {
    await API.purchaseProduct(id, { quantity, unitCost });
    closeModal("modal-purchase");
    showToast(t("stock_added"));
    await refreshAll();
  } catch(err){ handleApiError(err); }
});

function openProductModal(mode, id){
  const title = document.getElementById("product-modal-title");
  const idInput = document.getElementById("product-edit-id");
  const p = mode === "edit"
    ? (state.products.find(x => x.id === id) || state.outOfStock.find(x => x.id === id))
    : null;

  document.getElementById("product-model-add-row").style.display = "none";
  document.getElementById("product-model-list").classList.remove("open");

  if(p){
    title.textContent = t("edit_product");
    document.getElementById("product-name-input").value = p.name;
    document.getElementById("product-category-input").value = p.category || "Other Accessories";
    document.getElementById("product-brand-input").value = p.brand || "";
    document.getElementById("product-description-input").value = p.description || "";
    document.getElementById("product-wattage-input").value = p.wattage || "";
    document.getElementById("product-connector-input").value = p.connectorType || "";
    document.getElementById("product-model-id").value = p.compatibleModelId || "";
    document.getElementById("product-model-search").value = p.compatibleModelName || "";
    document.getElementById("product-qty-input").value = p.quantity || 0;
    document.getElementById("product-wholesale-input").value = p.buyingPrice || "";
    document.getElementById("product-selling-input").value = p.sellingPrice || "";
    document.getElementById("product-image-input").value = p.imageUrl || "";
    document.getElementById("product-notes-input").value = p.notes || "";
    document.getElementById("product-barcode-input").value = p.barcode || "";
    document.getElementById("product-minstock-input").value = p.minimumStock !== undefined ? p.minimumStock : 5;
    idInput.value = p.id;
  } else {
    title.textContent = t("add_product");
    document.getElementById("product-name-input").value = "";
    document.getElementById("product-category-input").value = "Other Accessories";
    document.getElementById("product-brand-input").value = "";
    document.getElementById("product-description-input").value = "";
    document.getElementById("product-wattage-input").value = "";
    document.getElementById("product-connector-input").value = "";
    document.getElementById("product-model-id").value = "";
    document.getElementById("product-model-search").value = "";
    document.getElementById("product-qty-input").value = 0;
    document.getElementById("product-wholesale-input").value = "";
    document.getElementById("product-selling-input").value = "";
    document.getElementById("product-image-input").value = "";
    document.getElementById("product-notes-input").value = "";
    document.getElementById("product-barcode-input").value = "";
    document.getElementById("product-minstock-input").value = 5;
    idInput.value = "";
  }
  syncProductTypeFields();
  loadDeviceModels("");
  openModal("modal-product");
  setTimeout(()=> document.getElementById("product-name-input").focus(), 100);
}

document.getElementById("add-product-btn").addEventListener("click", ()=> openProductModal("add"));
document.getElementById("product-category-input").addEventListener("change", syncProductTypeFields);

document.getElementById("product-form").addEventListener("submit", async function(e){
  e.preventDefault();
  const name = document.getElementById("product-name-input").value.trim();
  const category = document.getElementById("product-category-input").value;
  const brand = document.getElementById("product-brand-input").value.trim();
  const description = document.getElementById("product-description-input").value.trim();
  const wattage = document.getElementById("product-wattage-input").value.trim();
  const connectorType = document.getElementById("product-connector-input").value.trim();
  const compatibleModelId = document.getElementById("product-model-id").value || null;
  const quantity = parseInt(document.getElementById("product-qty-input").value, 10) || 0;
  const buyingPrice = parseFloat(document.getElementById("product-wholesale-input").value) || 0;
  const sellingPrice = parseFloat(document.getElementById("product-selling-input").value) || 0;
  const imageUrl = document.getElementById("product-image-input").value.trim();
  const notes = document.getElementById("product-notes-input").value.trim();
  const barcode = document.getElementById("product-barcode-input").value.trim();
  const minimumStock = parseInt(document.getElementById("product-minstock-input").value, 10) || 5;
  const editId = document.getElementById("product-edit-id").value;
  if(!name){ showToast(t("fill_required"),"error"); return; }
  if(MODEL_REQUIRED_TYPES.includes(category) && !compatibleModelId){
    showToast(t("model_required"),"error");
    return;
  }

  const payload = { name, category, brand, description, wattage, connectorType, compatibleModelId, quantity, buyingPrice, sellingPrice, imageUrl, notes, barcode, minimumStock };

  try {
    if(editId){
      await API.updateProduct(editId, payload);
      showToast(t("product_updated"));
    } else {
      await API.createProduct(payload);
      showToast(t("product_added"));
    }
    closeModal("modal-product");
    await refreshAll();
  } catch(err){
    handleApiError(err);
  }
});

async function deleteProduct(id){
  if(!confirm(t("confirm_delete_product"))) return;
  try {
    await API.deleteProduct(id);
    showToast(t("product_deleted"));
    await refreshAll();
  } catch(err){
    handleApiError(err);
  }
}

document.getElementById("product-search").addEventListener("input", function(){
  state.productFilter = this.value;
  renderProducts();
});
document.getElementById("category-filter").addEventListener("change", ()=> renderProducts());
document.getElementById("brand-filter").addEventListener("change", ()=> renderProducts());

/* ---------------------------------------------------------------
   11. SALES — DAY SESSION LIFECYCLE  (/api/sessions, /api/sales)
   --------------------------------------------------------------- */
function openStartDayModal(){
  document.getElementById("day-name-input").value = "";
  const dateInput = document.getElementById("day-date-input");
  const now = new Date();
  dateInput.value = now.toISOString().slice(0,10);
  openModal("modal-startday");
}

document.getElementById("guard-start-day-btn").addEventListener("click", openStartDayModal);

document.getElementById("startday-form").addEventListener("submit", async function(e){
  e.preventDefault();
  if(state.session){ showToast(t("active_day_exists"),"error"); closeModal("modal-startday"); return; }
  const dayName = document.getElementById("day-name-input").value.trim();
  const date = document.getElementById("day-date-input").value;
  if(!dayName || !date){ showToast(t("fill_required"),"error"); return; }

  try {
    await API.startDay({ dayName, date });
    closeModal("modal-startday");
    showToast(t("day_started"));
    await refreshAll();
  } catch(err){
    handleApiError(err);
  }
});

function renderSalesGuard(){
  const guard = document.getElementById("sales-guard");
  const active = document.getElementById("sales-active-wrap");
  if(state.session){
    guard.style.display = "none";
    active.style.display = "block";
  } else {
    guard.style.display = "flex";
    active.style.display = "none";
  }
}

/* ---- sale line helper: server sale → the shape the original UI used ---- */
function saleLine(sale){
  const it = (sale.items && sale.items[0]) || {};
  return {
    id: sale.id,
    invoice: sale.saleNumber || "",
    productId: it.productId || "",
    product: it.productName || "",
    productBrand: it.productBrand || "",
    productDescription: it.productDescription || "",
    isManual: !!it.isManual,
    qty: it.quantity || 0,
    cost: Number(it.unitCost) || 0,
    sell: Number(it.unitPrice) || 0,
    payment: sale.paymentMethod || "cash",
    time: sale.createdAt || new Date().toISOString()
  };
}

/* ============================================================
   SALES — searchable autocomplete (inventory products + manual
   free-text items/services in ONE field)
   ============================================================ */
function saleSearchMatches(text){
  const q = (text || "").trim().toLowerCase();
  if(!q) return [];
  return state.products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.brand || "").toLowerCase().includes(q) ||
    (p.description || "").toLowerCase().includes(q) ||
    (p.connectorType || "").toLowerCase().includes(q) ||
    (p.wattage || "").toLowerCase().includes(q)
  ).slice(0, 12);
}

function renderSaleSearchList(text){
  const listEl = document.getElementById("sale-search-list");
  const q = (text || "").trim();
  const matches = saleSearchMatches(q);

  let html = "";
  // manual / free-text option — always offered while typing
  if(q.length > 0){
    html += `<div class="combobox-item manual" data-sale-manual>
      <div class="ci-name"><span class="ci-tag">${t("service")}</span> ${t("add_manual")}: ${escapeHtml(q)}</div>
      <div class="ci-desc">${t("manual_hint")}</div>
    </div>`;
  }
  matches.forEach(p => {
    const desc = productDescriptionText(p);
    html += `<div class="combobox-item" data-sale-product="${p.id}">
      <div class="ci-name">${escapeHtml(p.name)}${p.brand ? ` <span style="color:var(--text-muted); font-weight:600;">— ${escapeHtml(p.brand)}</span>` : ""}</div>
      ${desc ? `<div class="ci-desc">${escapeHtml(desc)}</div>` : ""}
      <div class="ci-meta">
        <span class="ci-stock">${t("stock_label")}: ${p.quantity}</span>
        <span class="ci-price">${fmt(p.sellingPrice)}</span>
      </div>
    </div>`;
  });

  if(q.length === 0){
    html = `<div class="combobox-item" style="cursor:default;"><div class="ci-desc">${t("search_product_hint")}</div></div>`;
  } else if(matches.length === 0){
    // only the manual option remains — fine
  }

  listEl.innerHTML = html;
  listEl.classList.add("open");

  listEl.querySelectorAll("[data-sale-product]").forEach(el => {
    el.addEventListener("click", () => selectSaleProduct(el.getAttribute("data-sale-product")));
  });
  const manualEl = listEl.querySelector("[data-sale-manual]");
  if(manualEl) manualEl.addEventListener("click", () => selectManualItem(q));
}

function selectSaleProduct(id){
  const p = state.products.find(x => x.id === id);
  if(!p) return;
  state.saleSelected = { type: "product", product: p };
  document.getElementById("sale-product-id").value = p.id;
  document.getElementById("sale-search").value = p.name;
  document.getElementById("sale-sell").value = p.sellingPrice || 0;
  document.getElementById("sale-qty").max = p.quantity;
  document.getElementById("sale-qty").value = Math.min(parseInt(document.getElementById("sale-qty").value, 10) || 1, p.quantity || 1);
  const info = document.getElementById("sale-selected-info");
  const desc = productDescriptionText(p);
  info.style.display = "flex";
  info.innerHTML = `
    <div style="flex:1;">
      <div class="ss-name">${escapeHtml(p.name)}${p.brand ? ` <span style="color:var(--text-muted); font-weight:600;">— ${escapeHtml(p.brand)}</span>` : ""}</div>
      ${desc ? `<div class="ss-desc">${escapeHtml(desc)}</div>` : ""}
      <div class="ss-meta">${t("stock_label")}: ${p.quantity} · ${fmt(p.sellingPrice)}</div>
    </div>
    <button type="button" class="ss-clear" id="sale-clear-selection" title="Clear">✕</button>`;
  document.getElementById("sale-clear-selection").addEventListener("click", clearSaleSelection);
  document.getElementById("sale-search-list").classList.remove("open");
  updateProfitPreview();
}

function selectManualItem(text){
  state.saleSelected = { type: "manual", text };
  document.getElementById("sale-product-id").value = "";
  document.getElementById("sale-search").value = text;
  document.getElementById("sale-sell").value = "";
  document.getElementById("sale-qty").max = 100000;
  const info = document.getElementById("sale-selected-info");
  info.style.display = "flex";
  info.innerHTML = `
    <div style="flex:1;">
      <div class="ss-name"><span class="pill manual">${t("service")}</span> ${escapeHtml(text)}</div>
      <div class="ss-desc">${t("manual_hint")}</div>
    </div>
    <button type="button" class="ss-clear" id="sale-clear-selection" title="Clear">✕</button>`;
  document.getElementById("sale-clear-selection").addEventListener("click", clearSaleSelection);
  document.getElementById("sale-search-list").classList.remove("open");
  updateProfitPreview();
}

function clearSaleSelection(){
  state.saleSelected = null;
  document.getElementById("sale-product-id").value = "";
  document.getElementById("sale-search").value = "";
  document.getElementById("sale-selected-info").style.display = "none";
  document.getElementById("sale-sell").value = "";
  updateProfitPreview();
}

document.getElementById("sale-search").addEventListener("input", function(){
  // typing invalidates any previous selection unless the text still matches
  if(state.saleSelected){
    if(state.saleSelected.type === "product" && this.value !== state.saleSelected.product.name){
      state.saleSelected = null;
      document.getElementById("sale-product-id").value = "";
      document.getElementById("sale-selected-info").style.display = "none";
    } else if(state.saleSelected.type === "manual" && this.value !== state.saleSelected.text){
      state.saleSelected = null;
      document.getElementById("sale-selected-info").style.display = "none";
    }
  }
  renderSaleSearchList(this.value);
});
document.getElementById("sale-search").addEventListener("focus", function(){
  if(!this.value) renderSaleSearchList("");
});
document.getElementById("sale-search").addEventListener("blur", () => {
  setTimeout(()=> document.getElementById("sale-search-list").classList.remove("open"), 200);
});
document.getElementById("sale-search").addEventListener("keydown", function(e){
  if(e.key === "Enter"){
    const q = this.value.trim();
    if(q && !state.saleSelected){ selectManualItem(q); e.preventDefault(); }
  }
  if(e.key === "Escape"){ document.getElementById("sale-search-list").classList.remove("open"); }
});

/* ---- payment method chips ---- */
document.querySelectorAll(".radio-chip").forEach(chip=>{
  chip.addEventListener("click", function(){
    document.querySelectorAll(".radio-chip").forEach(c => c.classList.remove("selected"));
    this.classList.add("selected");
    state.paymentMethod = this.getAttribute("data-pay");
  });
});

/* ---- live profit preview (cost is internal FIFO — estimate shown) ---- */
function updateProfitPreview(){
  const sell = parseFloat(document.getElementById("sale-sell").value) || 0;
  const qty = parseFloat(document.getElementById("sale-qty").value) || 0;
  let profit = sell * qty;
  if(state.saleSelected && state.saleSelected.type === "product"){
    // estimate using the CURRENT purchase price; the actual FIFO cost is
    // computed by the backend at sale time
    const estCost = state.saleSelected.product.buyingPrice || 0;
    profit = (sell - estCost) * qty;
  }
  const el = document.getElementById("sale-profit-preview");
  el.textContent = fmt(profit);
  el.style.color = profit < 0 ? "var(--accent-rose)" : "var(--accent-cyan)";
}
["sale-sell","sale-qty"].forEach(id=>{
  document.getElementById(id).addEventListener("input", updateProfitPreview);
});

/* ---- add / edit sale ---- */
document.getElementById("sale-form").addEventListener("submit", async function(e){
  e.preventDefault();
  if(!state.session){ showToast(t("active_day_exists"),"error"); return; }

  const productId = document.getElementById("sale-product-id").value;
  const manualText = state.saleSelected && state.saleSelected.type === "manual"
    ? state.saleSelected.text : "";
  const qty = parseInt(document.getElementById("sale-qty").value, 10);
  const sell = parseFloat(document.getElementById("sale-sell").value);
  const editId = document.getElementById("sale-edit-id").value;

  if(!productId && !manualText){ showToast(t("select_product_first"), "error"); return; }
  if(!qty || qty < 1 || isNaN(sell) || sell < 0){ showToast(t("fill_required"), "error"); return; }
  if(manualText && (!sell || sell <= 0)){ showToast(t("manual_price_required"), "error"); return; }

  const payload = {
    quantity: qty,
    unitPrice: sell,
    paymentMethod: state.paymentMethod
  };
  if(productId) payload.productId = productId;
  else payload.manualText = manualText;

  try {
    if(editId){
      await API.updateSale(editId, payload);
      showToast(t("sale_updated"));
    } else {
      await API.createSale(payload);
      showToast(t("sale_added"));
    }
    resetSaleForm();
    await refreshAll();
  } catch(err){
    handleApiError(err); // e.g. INSUFFICIENT_STOCK → friendly server message
  }
});

function resetSaleForm(){
  state.saleSelected = null;
  document.getElementById("sale-form").reset();
  document.getElementById("sale-search").value = "";
  document.getElementById("sale-product-id").value = "";
  document.getElementById("sale-selected-info").style.display = "none";
  document.getElementById("sale-qty").value = 1;
  document.getElementById("sale-edit-id").value = "";
  document.getElementById("sale-submit-btn").querySelector("span").textContent = t("record_sale");
  document.querySelectorAll(".radio-chip").forEach(c => c.classList.remove("selected"));
  document.querySelector('.radio-chip[data-pay="cash"]').classList.add("selected");
  state.paymentMethod = "cash";
  updateProfitPreview();
}

function editSale(id){
  const sale = state.session.sales.find(s => s.id === id);
  if(!sale) return;
  const line = saleLine(sale);
  const searchInput = document.getElementById("sale-search");
  const selInfo = document.getElementById("sale-selected-info");
  document.getElementById("sale-qty").value = line.qty;
  document.getElementById("sale-sell").value = line.sell;
  document.getElementById("sale-edit-id").value = sale.id;
  document.querySelectorAll(".radio-chip").forEach(c => c.classList.toggle("selected", c.getAttribute("data-pay") === line.payment));
  state.paymentMethod = line.payment;
  document.getElementById("sale-submit-btn").querySelector("span").textContent = t("update_sale");

  if(line.isManual || !line.productId){
    state.saleSelected = { type: "manual", text: line.product };
    searchInput.value = line.product;
    selInfo.style.display = "flex";
    selInfo.innerHTML = `
      <div style="flex:1;">
        <div class="ss-name"><span class="pill manual">${t("service")}</span> ${escapeHtml(line.product)}</div>
        <div class="ss-desc">${t("manual_hint")}</div>
      </div>
      <button type="button" class="ss-clear" id="sale-clear-selection" title="Clear">✕</button>`;
    document.getElementById("sale-clear-selection").addEventListener("click", clearSaleSelection);
  } else {
    const p = state.products.find(x => x.id === line.productId);
    if(p){
      selectSaleProduct(p.id);
    } else {
      // product no longer active (zero stock) — show it as read-only text
      state.saleSelected = null;
      searchInput.value = line.product;
      selInfo.style.display = "flex";
      selInfo.innerHTML = `<div style="flex:1;"><div class="ss-name">${escapeHtml(line.product)}</div><div class="ss-desc">${escapeHtml(line.productDescription || "")}</div></div>`;
    }
  }
  updateProfitPreview();
  document.getElementById("sale-form").scrollIntoView({behavior:"smooth", block:"center"});
}

async function deleteSale(id){
  if(!confirm(t("confirm_delete_sale"))) return;
  try {
    await API.deleteSale(id);
    showToast(t("sale_deleted"));
    await refreshAll();
  } catch(err){
    handleApiError(err);
  }
}

/* ---- sales table + live summary ---- */
function computeSessionTotals(session){
  const totals = { sales:0, cost:0, profit:0, cash:0, card:0, count:0 };
  if(!session) return totals;
  (session.sales || []).forEach(s=>{
    const line = saleLine(s);
    const lineSell = line.sell * line.qty;
    const lineCost = line.cost * line.qty;
    const lineProfit = lineSell - lineCost;
    totals.sales += lineSell;
    totals.cost += lineCost;
    totals.profit += lineProfit;
    totals.count += 1;
    if(line.payment === "cash") totals.cash += lineSell; else totals.card += lineSell;
  });
  return totals;
}

function renderSalesTable(){
  const tbody = document.getElementById("sales-tbody");
  if(!state.session || state.session.sales.length === 0){
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:30px; color:var(--text-muted);">${t("no_recent")}</td></tr>`;
    return;
  }
  const rows = [...state.session.sales].reverse().map(s => {
    const line = saleLine(s);
    const profit = (line.sell - line.cost) * line.qty;
    const timeStr = new Date(line.time).toLocaleTimeString(state.lang === "ar" ? "ar-EG" : "en-US", {hour:"2-digit", minute:"2-digit"});
    const nameHtml = line.isManual
      ? `<span class="pill manual">${t("service")}</span> ${escapeHtml(line.product)}`
      : (line.productBrand ? `${escapeHtml(line.product)} <span style="color:var(--text-muted); font-weight:600;">— ${escapeHtml(line.productBrand)}</span>` : escapeHtml(line.product));
    const descHtml = line.productDescription
      ? `<span class="td-desc">${escapeHtml(line.productDescription)}</span>` : "";
    return `<tr>
      <td><span class="invoice-badge">${escapeHtml(line.invoice)}</span></td>
      <td>${nameHtml}${descHtml}</td>
      <td class="num">${line.qty}</td>
      <td class="num">${fmt(line.cost)}</td>
      <td class="num">${fmt(line.sell)}</td>
      <td class="num"><span class="pill profit-pos">${fmt(profit)}</span></td>
      <td><span class="pill ${line.payment}">${line.payment === "cash" ? t("pay_cash") : t("pay_card")}</span></td>
      <td class="num">${timeStr}</td>
      <td>
        <div class="row-actions">
          <button class="edit-btn" data-id="${s.id}" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg></button>
          <button class="del-btn" data-id="${s.id}" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>
        </div>
      </td>
    </tr>`;
  }).join("");
  tbody.innerHTML = rows;
  tbody.querySelectorAll(".edit-btn").forEach(b => b.addEventListener("click", ()=> editSale(b.getAttribute("data-id"))));
  tbody.querySelectorAll(".del-btn").forEach(b => b.addEventListener("click", ()=> deleteSale(b.getAttribute("data-id"))));
}

function renderLiveSummary(){
  const totals = computeSessionTotals(state.session);
  const el = document.getElementById("live-summary");
  el.innerHTML = `
    <div class="receipt-row"><span>${t("summary_count")}</span><span class="amt">${totals.count}</span></div>
    <div class="receipt-row"><span>${t("summary_total")}</span><span class="amt">${fmt(totals.sales)}</span></div>
    <div class="receipt-row"><span>${t("summary_cost")}</span><span class="amt">${fmt(totals.cost)}</span></div>
    <div class="receipt-row"><span>${t("summary_profit")}</span><span class="amt">${fmt(totals.profit)}</span></div>
    <div class="receipt-row"><span>${t("summary_cash")}</span><span class="amt">${fmt(totals.cash)}</span></div>
    <div class="receipt-row"><span>${t("summary_card")}</span><span class="amt">${fmt(totals.card)}</span></div>
  `;
}

/* ---- close day ---- */
document.getElementById("close-day-btn").addEventListener("click", ()=>{
  if(!state.session) return;
  openModal("modal-closeday");
});

document.getElementById("confirm-close-day-btn").addEventListener("click", async ()=>{
  try {
    const report = await API.closeDay();
    closeModal("modal-closeday");
    showFinalReport(report);
    showToast(t("day_closed"));
    resetSaleForm();
    await refreshAll();
  } catch(err){
    handleApiError(err);
  }
});

function showFinalReport(report){
  const body = document.getElementById("final-report-body");
  const notesHtml = (report.notes && report.notes.length > 0)
    ? `<div style="margin-top:10px;"><div style="font-weight:700; margin-bottom:4px;">${t("daily_notes")}</div>` +
      report.notes.map(n => {
        const timeStr = new Date(n.createdAt).toLocaleTimeString(state.lang === "ar" ? "ar-EG" : "en-US", {hour:"2-digit", minute:"2-digit"});
        return `<div class="fr-line"><span>${timeStr}</span><span>${escapeHtml(n.text)}</span></div>`;
      }).join("") + `</div>`
    : "";
  body.innerHTML = `
    <div class="fr-line"><span>${t("report_day")}</span><span>${escapeHtml(report.dayName)}</span></div>
    <div class="fr-line"><span>${t("report_date")}</span><span>${escapeHtml(report.date)}</span></div>
    <div class="fr-line"><span>${t("report_count")}</span><span>${report.totals.count}</span></div>
    <div class="fr-line"><span>${t("report_cash")}</span><span>${fmt(report.totals.cash)}</span></div>
    <div class="fr-line"><span>${t("report_card")}</span><span>${fmt(report.totals.card)}</span></div>
    <div class="fr-line"><span>${t("report_total_cost")}</span><span>${fmt(report.totals.cost)}</span></div>
    <div class="fr-line fr-total"><span>${t("report_total_sales")}</span><span>${fmt(report.totals.sales)}</span></div>
    <div class="fr-line fr-total" style="color:var(--accent-cyan)"><span>${t("report_total_profit")}</span><span>${fmt(report.totals.profit)}</span></div>
    ${notesHtml}
  `;
  openModal("modal-finalreport");
}

/* ---- daily notes ---- */
function renderNotes(){
  const panel = document.getElementById("daily-notes-panel");
  if(!panel) return;
  if(!state.session){ panel.style.display = "none"; return; }
  panel.style.display = "";
  const el = document.getElementById("daily-notes-list");
  if(state.notes.length === 0){
    el.innerHTML = `<div class="empty-state" style="padding:18px;"><strong>${t("no_notes")}</strong></div>`;
    return;
  }
  el.innerHTML = [...state.notes].map(n => {
    const timeStr = new Date(n.createdAt).toLocaleTimeString(state.lang === "ar" ? "ar-EG" : "en-US", {hour:"2-digit", minute:"2-digit"});
    return `<div class="note-row">
      <span class="note-time">${timeStr}</span>
      <span class="note-text">${escapeHtml(n.text)}</span>
      <button type="button" class="note-del" data-note-id="${n.id}" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>`;
  }).join("");
  el.querySelectorAll(".note-del").forEach(b => b.addEventListener("click", ()=> deleteNote(b.getAttribute("data-note-id"))));
}

document.getElementById("note-add-btn").addEventListener("click", async ()=>{
  const input = document.getElementById("note-input");
  const text = input.value.trim();
  if(!text){ showToast(t("fill_required"), "error"); return; }
  try {
    await API.createNote(text);
    input.value = "";
    showToast(t("note_added"));
    await refreshAll();
  } catch(err){ handleApiError(err); }
});
document.getElementById("note-input").addEventListener("keydown", function(e){
  if(e.key === "Enter"){ e.preventDefault(); document.getElementById("note-add-btn").click(); }
});

async function deleteNote(id){
  if(!confirm(t("delete_note_confirm"))) return;
  try {
    await API.deleteNote(id);
    showToast(t("note_deleted"));
    await refreshAll();
  } catch(err){ handleApiError(err); }
}

/* ---------------------------------------------------------------
   12. REPORTS PAGE — data computed by the backend (/api/reports…)
   --------------------------------------------------------------- */
let currentReportTab = "daily";
const TAB_KEYS = { monthly:"monthly", "best-sellers":"bestSellers", "low-stock":"lowStock" };
let reportTabToken = 0;

function renderReportsTabs(){
  document.querySelectorAll("#reports-tabs .tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-tab") === currentReportTab);
  });
  ["daily","monthly","best-sellers","low-stock"].forEach(tab => {
    const el = document.getElementById("report-tab-" + tab);
    if(el) el.style.display = tab === currentReportTab ? "" : "none";
  });
}

document.querySelectorAll("#reports-tabs .tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    currentReportTab = btn.getAttribute("data-tab");
    renderReportsTabs();
    renderReports();
  });
});

function renderReports(){
  renderReportsTabs();
  if(currentReportTab === "daily"){ renderDailyReports(); return; }
  const key = TAB_KEYS[currentReportTab];
  if(state.reportsData[key] === undefined){ fetchTabReport(key); return; }
  renderTabByKey(key);
}

function renderTabByKey(key){
  if(key === "monthly") renderMonthlyReport();
  else if(key === "bestSellers") renderBestSellers();
  else if(key === "lowStock") renderLowStockReport();
}

async function fetchTabReport(key){
  state.reportsData[key] = null; // loading
  renderTabByKey(key);
  const fetchers = { monthly: API.getMonthly, bestSellers: API.getBestSellers, lowStock: API.getLowStock };
  const token = ++reportTabToken;
  try {
    const data = await fetchers[key]();
    if(token !== reportTabToken) return; // user switched tabs meanwhile
    state.reportsData[key] = data;
    if(TAB_KEYS[currentReportTab] === key) renderTabByKey(key);
  } catch(err){
    if(token !== reportTabToken) return;
    state.reportsData[key] = undefined;
    if(TAB_KEYS[currentReportTab] === key){
      const el = document.getElementById("report-tab-" + currentReportTab);
      if(el){
        el.innerHTML = `<div class="empty-state"><strong>${t("reports_error")}</strong><button class="btn btn-ghost" data-bm-retry-report>${t("retry")}</button></div>`;
        const btn = el.querySelector("[data-bm-retry-report]");
        if(btn) btn.addEventListener("click", () => {
          state.reportsData[TAB_KEYS[currentReportTab]] = undefined;
          renderReports();
        });
      }
    }
    handleApiError(err);
  }
}

function renderDailyReports(){
  const grid = document.getElementById("report-grid");
  if(state.reports.length === 0){
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19V9M12 19V5M20 19v-7"/></svg>
      <strong>${t("no_reports_title")}</strong>
      <span>${t("no_reports_desc")}</span>
    </div>`;
    return;
  }
  grid.innerHTML = state.reports.map(r => `
    <div class="glass-card report-card" data-id="${r.id}">
      <div class="rc-top">
        <span class="rc-day">${escapeHtml(r.dayName)}</span>
        <span class="pill profit-pos">${fmt(r.totals.profit)}</span>
      </div>
      <div class="rc-date">${escapeHtml(r.date)}</div>
      <div class="receipt-row"><span>${t("report_total_sales")}</span><span class="amt">${fmt(r.totals.sales)}</span></div>
      <div class="receipt-row"><span>${t("report_total_cost")}</span><span class="amt">${fmt(r.totals.cost)}</span></div>
      <div class="receipt-row"><span>${t("report_count")}</span><span class="amt">${r.totals.count}</span></div>
    </div>`).join("");
  grid.querySelectorAll(".report-card").forEach(card=>{
    card.addEventListener("click", ()=> openReportDetail(card.getAttribute("data-id")));
  });
}

function renderMonthlyReport(){
  const el = document.getElementById("report-tab-monthly");
  const months = state.reportsData.monthly;
  if(months === null){
    el.innerHTML = `<div class="empty-state"><div class="spinner"></div><span>${t("loading")}</span></div>`;
    return;
  }
  if(months.length === 0){
    el.innerHTML = `<div class="empty-state"><strong>${t("no_reports_title")}</strong><span>${t("no_reports_desc")}</span></div>`;
    return;
  }
  el.innerHTML = `<div class="report-grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr));">${months.map(m => `
    <div class="glass-card panel" style="animation:cardIn .4s ease both;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <strong style="font-size:1.05rem;">${escapeHtml(m.month)}</strong>
        <span class="pill profit-pos">${fmt(m.profit)}</span>
      </div>
      <div class="receipt-row"><span>${t("report_total_sales")}</span><span class="amt">${fmt(m.sales)}</span></div>
      <div class="receipt-row"><span>${t("report_total_cost")}</span><span class="amt">${fmt(m.cost)}</span></div>
      <div class="receipt-row"><span>${t("report_count")}</span><span class="amt">${m.count} ${t("times_sold")}</span></div>
    </div>`).join("")}</div>`;
}

function renderBestSellers(){
  const el = document.getElementById("report-tab-best-sellers");
  const products = state.reportsData.bestSellers;
  if(products === null){
    el.innerHTML = `<div class="empty-state"><div class="spinner"></div><span>${t("loading")}</span></div>`;
    return;
  }
  if(products.length === 0){
    el.innerHTML = `<div class="empty-state"><strong>${t("no_reports_title")}</strong><span>${t("no_reports_desc")}</span></div>`;
    return;
  }
  el.innerHTML = `<div class="glass-card panel"><div class="table-wrap"><table>
    <thead><tr><th>#</th><th>${t("field_product")}</th><th>${t("field_qty")}</th><th>${t("report_total_sales")}</th><th>${t("report_total_profit")}</th></tr></thead>
    <tbody>${products.map((p, i) => `<tr>
      <td class="num">${i + 1}</td><td>${escapeHtml(p.name)}</td>
      <td class="num">${p.qty} ${t("units_sold")}</td>
      <td class="num">${fmt(p.revenue)}</td>
      <td class="num"><span class="pill profit-pos">${fmt(p.profit)}</span></td>
    </tr>`).join("")}</tbody>
  </table></div></div>`;
}

function renderLowStockReport(){
  const el = document.getElementById("report-tab-low-stock");
  const low = state.reportsData.lowStock;
  if(low === null){
    el.innerHTML = `<div class="empty-state"><div class="spinner"></div><span>${t("loading")}</span></div>`;
    return;
  }
  if(low.length === 0){
    el.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 6L9 17l-5-5"/></svg><strong>${t("report_total_products")}</strong><span>All products are well-stocked.</span></div>`;
    return;
  }
  el.innerHTML = `<div class="low-stock-list">${low.map(p => `
    <div class="low-stock-item">
      <div><span class="lsi-name">${escapeHtml(p.name)}</span><br><span style="font-size:.75rem;color:var(--text-muted)">${escapeHtml(p.category || "")}</span></div>
      <span class="stock-badge ${stockClass(p.quantity||0)}">${p.quantity || 0}</span>
    </div>`).join("")}</div>`;
}

async function openReportDetail(id){
  try {
    const report = await API.getReport(id);
    document.getElementById("report-detail-title").textContent = `${report.dayName} — ${report.date}`;
    document.getElementById("report-detail-summary").innerHTML = `
      <div class="two-col" style="grid-template-columns:repeat(3,1fr); gap:10px;">
        <div class="receipt-row"><span>${t("report_total_sales")}</span><span class="amt">${fmt(report.totals.sales)}</span></div>
        <div class="receipt-row"><span>${t("report_total_cost")}</span><span class="amt">${fmt(report.totals.cost)}</span></div>
        <div class="receipt-row"><span>${t("report_total_profit")}</span><span class="amt">${fmt(report.totals.profit)}</span></div>
      </div>`;
    const tbody = document.getElementById("report-detail-tbody");
    tbody.innerHTML = report.sales.map(s => {
      const line = saleLine(s);
      const profit = (line.sell - line.cost) * line.qty;
      const timeStr = new Date(line.time).toLocaleTimeString(state.lang === "ar" ? "ar-EG" : "en-US", {hour:"2-digit", minute:"2-digit"});
      const nameHtml = line.isManual
        ? `<span class="pill manual">${t("service")}</span> ${escapeHtml(line.product)}`
        : escapeHtml(line.product);
      const descHtml = line.productDescription
        ? `<span class="td-desc">${escapeHtml(line.productDescription)}</span>` : "";
      return `<tr>
        <td>${line.invoice ? `<span class="invoice-badge">${escapeHtml(line.invoice)}</span> ` : ""}${nameHtml}${descHtml}</td>
        <td class="num">${line.qty}</td>
        <td class="num">${fmt(line.cost)}</td>
        <td class="num">${fmt(line.sell)}</td>
        <td class="num"><span class="pill profit-pos">${fmt(profit)}</span></td>
        <td><span class="pill ${line.payment}">${line.payment === "cash" ? t("pay_cash") : t("pay_card")}</span></td>
        <td class="num">${timeStr}</td>
      </tr>`;
    }).join("");

    // daily notes of that day
    const notesWrap = document.getElementById("report-detail-notes");
    const notesList = document.getElementById("report-detail-notes-list");
    if(report.notes && report.notes.length > 0){
      notesWrap.style.display = "";
      notesList.innerHTML = report.notes.map(n => {
        const timeStr = new Date(n.createdAt).toLocaleTimeString(state.lang === "ar" ? "ar-EG" : "en-US", {hour:"2-digit", minute:"2-digit"});
        return `<div class="note-row"><span class="note-time">${timeStr}</span><span class="note-text">${escapeHtml(n.text)}</span></div>`;
      }).join("");
    } else {
      notesWrap.style.display = "none";
    }
    openModal("modal-reportdetail");
  } catch(err){
    handleApiError(err);
  }
}

/* ---------------------------------------------------------------
   13. CUSTOMERS  (/api/customers)
   --------------------------------------------------------------- */
let currentCustomerId = null;

function renderCustomers(){
  const grid = document.getElementById("customer-grid");
  const search = (document.getElementById("customer-search")?.value || "").toLowerCase();
  let list = state.customers;
  if(search) list = list.filter(c => c.name.toLowerCase().includes(search) || (c.phone || "").toLowerCase().includes(search));

  const summaryEl = document.getElementById("customer-debt-summary");
  const totalOwed = state.customerSummary.totalOwed || 0;
  summaryEl.innerHTML = `
    <div class="glass-card stat-card" style="--glow:rgba(245,185,66,.22);padding:18px;">
      <div class="stat-top"><span class="stat-label">${t("customer_count")}</span></div>
      <div class="stat-value mono">${state.customerSummary.count || 0}</div>
    </div>
    <div class="glass-card stat-card" style="--glow:rgba(242,85,107,.22);padding:18px;">
      <div class="stat-top"><span class="stat-label">${t("total_owed")}</span></div>
      <div class="stat-value mono" style="color:${totalOwed > 0 ? 'var(--accent-amber)' : 'var(--accent-cyan)'}">${fmt(totalOwed)}</div>
    </div>
    <div class="glass-card stat-card" style="--glow:rgba(47,216,198,.22);padding:18px;">
      <div class="stat-top"><span class="stat-label">${t("total_credit")}</span></div>
      <div class="stat-value mono">${fmt(state.customerSummary.totalCredit || 0)}</div>
    </div>`;

  if(list.length === 0){
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
      <strong>${t("no_customers_title")}</strong><span>${t("no_customers_desc")}</span>
    </div>`;
    return;
  }
  grid.innerHTML = list.map(c => {
    const bal = c.balance || 0;
    const balClass = bal > 0 ? "owed" : bal < 0 ? "overdue" : "zero";
    return `<div class="glass-card customer-card" data-id="${c.id}">
      <div class="c-top"><span class="c-name">${escapeHtml(c.name)}</span>
        <div class="row-actions">
          <button class="edit-btn customer-edit" data-id="${c.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg></button>
          <button class="del-btn customer-del" data-id="${c.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>
        </div>
      </div>
      ${c.phone ? `<div class="c-phone">${escapeHtml(c.phone)}</div>` : ""}
      <div class="c-debt ${balClass}">${bal > 0 ? "+" : ""}${fmt(bal)}</div>
      ${c.notes ? `<div class="c-notes">${escapeHtml(c.notes)}</div>` : ""}
      <div class="c-actions">
        <button class="btn btn-primary customer-detail-btn" data-id="${c.id}" style="font-size:.8rem; padding:8px 14px;">${t("add_credit")}</button>
      </div>
    </div>`;
  }).join("");
  grid.querySelectorAll(".customer-detail-btn").forEach(b => b.addEventListener("click", () => openCustomerDetail(b.getAttribute("data-id"))));
  grid.querySelectorAll(".customer-edit").forEach(b => b.addEventListener("click", () => openCustomerModal("edit", b.getAttribute("data-id"))));
  grid.querySelectorAll(".customer-del").forEach(b => b.addEventListener("click", () => deleteCustomer(b.getAttribute("data-id"))));
}

document.getElementById("customer-search")?.addEventListener("input", () => renderCustomers());
document.getElementById("add-customer-btn").addEventListener("click", () => openCustomerModal("add"));

function openCustomerModal(mode, id){
  const title = document.getElementById("customer-modal-title");
  const idInput = document.getElementById("customer-edit-id");
  if(mode === "edit"){
    const c = state.customers.find(x => x.id === id);
    if(!c) return;
    title.textContent = t("edit_customer");
    document.getElementById("customer-name-input").value = c.name;
    document.getElementById("customer-phone-input").value = c.phone || "";
    document.getElementById("customer-notes-input").value = c.notes || "";
    idInput.value = c.id;
  } else {
    title.textContent = t("add_customer");
    document.getElementById("customer-name-input").value = "";
    document.getElementById("customer-phone-input").value = "";
    document.getElementById("customer-notes-input").value = "";
    idInput.value = "";
  }
  openModal("modal-customer");
}

document.getElementById("customer-form").addEventListener("submit", async function(e){
  e.preventDefault();
  const name = document.getElementById("customer-name-input").value.trim();
  const phone = document.getElementById("customer-phone-input").value.trim();
  const notes = document.getElementById("customer-notes-input").value.trim();
  const editId = document.getElementById("customer-edit-id").value;
  if(!name){ showToast(t("fill_required"), "error"); return; }
  try {
    if(editId){
      await API.updateCustomer(editId, { name, phone, notes });
      showToast(t("customer_updated"));
    } else {
      await API.createCustomer({ name, phone, notes });
      showToast(t("customer_added"));
    }
    closeModal("modal-customer");
    await refreshAll();
  } catch(err){
    handleApiError(err);
  }
});

async function deleteCustomer(id){
  if(!confirm(t("confirm_delete_customer"))) return;
  try {
    await API.deleteCustomer(id);
    showToast(t("customer_deleted"));
    await refreshAll();
  } catch(err){
    handleApiError(err);
  }
}

async function openCustomerDetail(id){
  currentCustomerId = id;
  try {
    const c = await API.getCustomer(id);
    const bal = c.balance || 0;
    document.getElementById("customer-detail-title").textContent = c.name;
    document.getElementById("customer-detail-info").innerHTML = `
      <div class="receipt-row"><span>${t("field_customer_phone")}</span><span class="amt">${escapeHtml(c.phone || "—")}</span></div>
      <div class="receipt-row"><span>${t("total_owed")}</span><span class="amt" style="color:${bal > 0 ? 'var(--accent-amber)' : 'var(--accent-cyan)'}; font-family:var(--font-mono); font-weight:700;">${fmt(bal)}</span></div>`;
    renderCustomerDebtHistory(c.transactions || []);
    openModal("modal-customer-detail");
  } catch(err){
    handleApiError(err);
  }
}

function renderCustomerDebtHistory(transactions){
  const el = document.getElementById("customer-debt-history");
  if(transactions.length === 0){
    el.innerHTML = `<div class="empty-state" style="padding:20px;"><strong>${t("no_debt_history")}</strong></div>`;
    return;
  }
  el.innerHTML = [...transactions].reverse().map(tr => {
    const dateStr = new Date(tr.createdAt).toLocaleDateString(state.lang === "ar" ? "ar-EG" : "en-US");
    return `<div class="debt-row">
      <div><span class="debt-type ${tr.type}">${tr.type === "credit" ? t("add_credit") : t("record_payment")}</span><br><span style="font-size:.75rem;color:var(--text-muted)">${dateStr}${tr.note ? " — " + escapeHtml(tr.note) : ""}</span></div>
      <span class="debt-amt" style="color:${tr.type === 'credit' ? 'var(--accent-amber)' : 'var(--accent-cyan)'}">${tr.type === 'credit' ? '+' : '-'}${fmt(tr.amount)}</span>
    </div>`;
  }).join("");
}

document.getElementById("customer-add-debt-btn").addEventListener("click", async () => {
  const amount = parseFloat(prompt(t("field_amount")));
  if(isNaN(amount) || amount <= 0) return;
  const note = prompt(t("field_debt_note")) || "";
  try {
    await API.addCustomerTransaction(currentCustomerId, { type: "credit", amount, note });
    showToast(t("credit_added"));
    await refreshAll();
    await openCustomerDetail(currentCustomerId);
  } catch(err){
    handleApiError(err);
  }
});

document.getElementById("customer-add-payment-btn").addEventListener("click", async () => {
  const c = state.customers.find(x => x.id === currentCustomerId);
  const bal = c ? (c.balance || 0) : 0;
  if(bal <= 0){ showToast(t("no_debt_history"), "info"); return; }
  const amount = parseFloat(prompt(t("field_amount"), bal));
  if(isNaN(amount) || amount <= 0) return;
  try {
    await API.addCustomerTransaction(currentCustomerId, { type: "payment", amount, note: "" });
    showToast(t("payment_recorded"));
    await refreshAll();
    await openCustomerDetail(currentCustomerId);
  } catch(err){
    handleApiError(err);
  }
});

/* ---------------------------------------------------------------
   14. BARCODE SCANNER — PAGE
   --------------------------------------------------------------- */
let pageScanner = null;

document.getElementById("scanner-start-btn").addEventListener("click", startPageScanner);
document.getElementById("scanner-stop-btn").addEventListener("click", stopPageScanner);
document.getElementById("scanner-manual-btn").addEventListener("click", () => openModal("modal-manual-barcode"));

document.getElementById("manual-barcode-form").addEventListener("submit", function(e){
  e.preventDefault();
  const code = document.getElementById("manual-barcode-input").value.trim();
  if(code) lookupBarcode(code);
  closeModal("modal-manual-barcode");
  document.getElementById("manual-barcode-input").value = "";
});

function startPageScanner(){
  if(typeof Html5Qrcode === "undefined"){ showToast(t("scanner_unavailable"), "error"); return; }
  if(pageScanner) stopPageScanner();
  pageScanner = new Html5Qrcode("scanner-reader");
  pageScanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.333 },
    (decodedText) => {
      lookupBarcode(decodedText);
      stopPageScanner();
    },
    () => {}
  ).then(() => {
    document.getElementById("scanner-start-btn").style.display = "none";
    document.getElementById("scanner-stop-btn").style.display = "inline-flex";
  }).catch(err => {
    showToast("Camera error: " + err, "error");
    pageScanner = null;
  });
}

function stopPageScanner(){
  if(pageScanner){
    pageScanner.stop().then(() => {
      pageScanner.clear();
      pageScanner = null;
      document.getElementById("scanner-start-btn").style.display = "inline-flex";
      document.getElementById("scanner-stop-btn").style.display = "none";
    }).catch(() => {
      pageScanner = null;
      document.getElementById("scanner-start-btn").style.display = "inline-flex";
      document.getElementById("scanner-stop-btn").style.display = "none";
    });
  }
}

async function lookupBarcode(code){
  const resultEl = document.getElementById("scanner-result");
  try {
    const product = await API.getProductByBarcode(code);
    const bal = product.quantity || 0;
    resultEl.className = "scanner-result";
    resultEl.innerHTML = `
      <div class="sr-barcode">${escapeHtml(code)}</div>
      <div class="sr-product">${escapeHtml(product.name)}</div>
      <div class="sr-stock">${t("stock_label")}: <strong>${bal}</strong> | ${t("field_sell")}: <strong>${fmt(product.sellingPrice)}</strong></div>`;
    showToast(t("barcode_scanned"), "success");
  } catch(err){
    if(err.status === 404){
      resultEl.className = "scanner-no-result";
      resultEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg><p><strong>${escapeHtml(code)}</strong><br>${t("barcode_not_found")}</p>`;
      showToast(t("barcode_not_found"), "error");
    } else {
      handleApiError(err);
    }
  }
}

/* ---------------------------------------------------------------
   BARCODE SCANNER — PRODUCT FORM
   --------------------------------------------------------------- */
let productScanner = null;

document.getElementById("product-barcode-scan-btn").addEventListener("click", startProductBarcodeScan);
document.getElementById("barcode-scan-cancel").addEventListener("click", stopProductBarcodeScan);

function startProductBarcodeScan(){
  if(typeof Html5Qrcode === "undefined"){ showToast(t("scanner_unavailable"), "error"); return; }
  if(productScanner) stopProductBarcodeScan();
  productScanner = new Html5Qrcode("barcode-scan-reader");
  document.getElementById("barcode-scan-overlay").classList.add("active");
  productScanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.333 },
    (decodedText) => {
      document.getElementById("product-barcode-input").value = decodedText;
      stopProductBarcodeScan();
      showToast(t("barcode_scanned") + ": " + decodedText, "success");
    },
    () => {}
  ).then(() => {}).catch(err => {
    stopProductBarcodeScan();
    showToast("Camera error: " + err, "error");
  });
}

function stopProductBarcodeScan(){
  if(productScanner){
    productScanner.stop().then(() => {
      productScanner.clear();
      productScanner = null;
      document.getElementById("barcode-scan-overlay").classList.remove("active");
    }).catch(() => {
      productScanner = null;
      document.getElementById("barcode-scan-overlay").classList.remove("active");
    });
  } else {
    document.getElementById("barcode-scan-overlay").classList.remove("active");
  }
}

/* ---------------------------------------------------------------
   15. SETTINGS + ACCOUNT
   --------------------------------------------------------------- */
document.querySelectorAll(".lang-toggle-btns button").forEach(btn=>{
  btn.addEventListener("click", ()=> applyLanguage(btn.getAttribute("data-lang")));
});
document.getElementById("lang-toggle").addEventListener("click", ()=>{
  applyLanguage(state.lang === "en" ? "ar" : "en");
});
document.getElementById("theme-switch").addEventListener("click", ()=>{
  applyTheme(state.theme === "dark" ? "light" : "dark");
});
document.getElementById("theme-toggle").addEventListener("click", ()=>{
  applyTheme(state.theme === "dark" ? "light" : "dark");
});

document.getElementById("clear-data-btn").addEventListener("click", async ()=>{
  if(!confirm(t("confirm_clear_data"))) return;
  try {
    await API.clearData();
    showToast(t("data_cleared"));
    await refreshAll();
  } catch(err){
    handleApiError(err);
  }
});

/* ---- change password ---- */
document.getElementById("change-password-btn").addEventListener("click", ()=>{
  document.getElementById("change-password-form").reset();
  document.getElementById("cp-username").value = state.user ? state.user.username : "";
  openModal("modal-changepassword");
});

document.getElementById("change-password-form").addEventListener("submit", async function(e){
  e.preventDefault();
  const current = document.getElementById("cp-current").value;
  const username = document.getElementById("cp-username").value.trim();
  const np = document.getElementById("cp-new").value;
  const confirm = document.getElementById("cp-confirm").value;

  if(!current){ showToast(t("fill_required"), "error"); return; }
  if(np && np.length < 8){ showToast(t("password_too_short"), "error"); return; }
  if(np && np !== confirm){ showToast(t("password_mismatch"), "error"); return; }
  if(!username && !np){ showToast(t("fill_required"), "error"); return; }

  const payload = { currentPassword: current };
  if(username) payload.username = username;
  if(np) payload.newPassword = np;

  try {
    const res = await API.changePassword(payload);
    if(res.user) state.user = res.user;
    closeModal("modal-changepassword");
    document.getElementById("change-password-form").reset();
    updateAccountRow();
    showToast(t("password_changed"));
  } catch(err){
    handleApiError(err);
  }
});

/* ---- logout ---- */
async function handleLogout(){
  try { await API.logout(); } catch(e){ /* session may already be dead */ }
  state.authed = false;
  state.user = null;
  state.products = [];
  state.outOfStock = [];
  state.deviceModels = [];
  state.saleSelected = null;
  state.session = null;
  state.notes = [];
  state.reports = [];
  state.reportsData = {};
  state.customers = [];
  state.customerSummary = { count:0, totalOwed:0, totalCredit:0 };
  state.dashboard = null;
  stopPageScanner();
  showLogin();
  showToast(t("logged_out"), "info");
}
document.getElementById("logout-btn").addEventListener("click", handleLogout);
document.getElementById("logout-btn-2").addEventListener("click", handleLogout);

/* ---------------------------------------------------------------
   16. LIVE CLOCK
   --------------------------------------------------------------- */
function tickClock(){
  const el = document.getElementById("live-clock");
  if(el) el.textContent = new Date().toLocaleTimeString(state.lang === "ar" ? "ar-EG" : "en-US");
}

/* ---------------------------------------------------------------
   17. UTIL
   --------------------------------------------------------------- */
function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

/* ---------------------------------------------------------------
   18. AUTH FLOW (login screen ↔ app)
   --------------------------------------------------------------- */
document.getElementById("login-form").addEventListener("submit", async function(e){
  e.preventDefault();
  const errEl = document.getElementById("login-error");
  errEl.classList.remove("active");
  errEl.textContent = "";

  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;
  const btn = document.getElementById("login-submit-btn");
  if(!username || !password){ errEl.textContent = t("fill_required"); errEl.classList.add("active"); return; }

  btn.disabled = true;
  try {
    const res = await API.login(username, password);
    state.authed = true;
    state.user = res.user;
    setLoading(true);
    try {
      await loadData();
    } finally {
      setLoading(false);
    }
    showApp();
    resetSaleForm();
    updateAccountRow();
    renderAll();
  } catch(err){
    if(err.status === 401 || err.status === 400){
      errEl.textContent = err.message || t("login_failed");
    } else if(err.status === 429){
      errEl.textContent = err.message;
    } else {
      errEl.textContent = (err && err.message) || t("offline_desc");
    }
    errEl.classList.add("active");
  } finally {
    btn.disabled = false;
  }
});

document.getElementById("retry-btn").addEventListener("click", ()=>{
  document.getElementById("offline-screen").classList.remove("active");
  setLoading(true);
  boot();
});

// Any 401 while the user is signed in → back to the login screen
API.onUnauthorized = (err) => {
  if(!state.authed) return; // login attempts handle their own errors
  state.authed = false;
  state.user = null;
  state.products = [];
  state.outOfStock = [];
  state.deviceModels = [];
  state.saleSelected = null;
  state.session = null;
  state.notes = [];
  state.reports = [];
  state.reportsData = {};
  state.customers = [];
  state.dashboard = null;
  stopPageScanner();
  showLogin();
  showToast(err && err.message ? err.message : t("session_expired"), "error");
};

/* ---------------------------------------------------------------
   19. MASTER RENDER + INIT
   --------------------------------------------------------------- */
function renderAll(){
  renderDashboard();
  renderProducts();
  renderSalesGuard();
  renderSalesTable();
  renderLiveSummary();
  renderNotes();
  renderReports();
  renderCustomers();
  updateSessionPill();
}

async function boot(){
  try {
    await API.me();
  } catch(err){
    setLoading(false);
    if(err.status === 401){ showLogin(); return; }
    showOffline();
    return;
  }
  state.authed = true;
  try {
    await loadData();
    state.user = await API.me().then(d => d.user);
  } catch(err){
    setLoading(false);
    if(err.status === 401){ state.authed = false; showLogin(); return; }
    showOffline();
    return;
  }
  setLoading(false);
  showApp();
  resetSaleForm();
  updateAccountRow();
  renderAll();
}

function init(){
  applyTheme(state.theme);
  applyLanguage(state.lang);
  tickClock();
  setInterval(tickClock, 1000);
  setLoading(true);
  boot();
}

init();
