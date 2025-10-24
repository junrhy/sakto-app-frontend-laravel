const Ziggy = {
    url: 'http:\/\/127.0.0.1:8000',
    port: 8000,
    defaults: {},
    routes: {
        'sanctum.csrf-cookie': {
            uri: 'sanctum\/csrf-cookie',
            methods: ['GET', 'HEAD'],
        },
        'lemon-squeezy.webhook': {
            uri: 'lemon-squeezy\/webhook',
            methods: ['POST'],
        },
        public: { uri: 'public', methods: ['GET', 'HEAD'] },
        solutions: { uri: 'solutions', methods: ['GET', 'HEAD'] },
        neulify: { uri: 'neulify', methods: ['GET', 'HEAD'] },
        shop: { uri: 'shop', methods: ['GET', 'HEAD'] },
        delivery: { uri: 'delivery', methods: ['GET', 'HEAD'] },
        jobs: { uri: 'jobs', methods: ['GET', 'HEAD'] },
        medical: { uri: 'medical', methods: ['GET', 'HEAD'] },
        travel: { uri: 'travel', methods: ['GET', 'HEAD'] },
        fnb: { uri: 'fnb', methods: ['GET', 'HEAD'] },
        'travel.show': {
            uri: 'travel\/{identifier}',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'medical.clinic.show': {
            uri: 'medical\/clinic\/{identifier}',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'medical.clinic.book-appointment': {
            uri: 'medical\/clinic\/{identifier}\/book-appointment',
            methods: ['POST'],
            parameters: ['identifier'],
        },
        'embed.appointment.widget': {
            uri: 'embed\/appointment\/{identifier}',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'embed.appointment.script': {
            uri: 'embed\/appointment\/{identifier}\/script',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'embed.appointment.widget.js': {
            uri: 'embed\/appointment\/{identifier}\/widget.js',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'contacts.self-registration': {
            uri: 'contacts\/self-registration',
            methods: ['GET', 'HEAD'],
        },
        'contacts.store-self': {
            uri: 'contacts\/store-self',
            methods: ['POST'],
        },
        'contacts.public-profile': {
            uri: 'contacts\/{id}\/public',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'contacts.list': { uri: 'contacts\/list', methods: ['GET', 'HEAD'] },
        'contacts.bulk-delete': {
            uri: 'contacts\/bulk-delete',
            methods: ['POST'],
        },
        'public.contacts.wallet.balance': {
            uri: 'public\/contacts\/{contactId}\/wallet\/balance',
            methods: ['GET', 'HEAD'],
            parameters: ['contactId'],
        },
        'public.contacts.wallet.transactions': {
            uri: 'public\/contacts\/{contactId}\/wallet\/transactions',
            methods: ['GET', 'HEAD'],
            parameters: ['contactId'],
        },
        'public.contacts.wallet.transfer': {
            uri: 'public\/contacts\/{contactId}\/wallet\/transfer',
            methods: ['POST'],
            parameters: ['contactId'],
        },
        'public.contacts.wallet.available-contacts': {
            uri: 'public\/contacts\/{contactId}\/wallet\/available-contacts',
            methods: ['GET', 'HEAD'],
            parameters: ['contactId'],
        },
        'events.public-register': {
            uri: 'events\/{id}\/public-register',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'events.public-register.store': {
            uri: 'events\/{id}\/public-register',
            methods: ['POST'],
            parameters: ['id'],
        },
        'events.checkout': {
            uri: 'events\/{id}\/checkout',
            methods: ['POST'],
            parameters: ['id'],
        },
        'events.public-show': {
            uri: 'events\/{id}\/public',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'challenges.public-register': {
            uri: 'challenges\/{id}\/public-register',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'challenges.public-register.store': {
            uri: 'challenges\/{id}\/public-register',
            methods: ['POST'],
            parameters: ['id'],
        },
        'challenges.public-show': {
            uri: 'challenges\/{id}\/public',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'pages.public': {
            uri: 'link\/{slug}',
            methods: ['GET', 'HEAD'],
            parameters: ['slug'],
        },
        'api.pages.get-by-slug': {
            uri: 'api\/pages\/{slug}',
            methods: ['GET', 'HEAD'],
            parameters: ['slug'],
        },
        'health-insurance.members.show.public': {
            uri: 'health-insurance\/members\/{id}\/public',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'member.public-checkout.store': {
            uri: 'member\/checkout',
            methods: ['POST'],
        },
        'member.public-checkout.success': {
            uri: 'member\/checkout\/success',
            methods: ['GET', 'HEAD'],
        },
        'content-creator.public': {
            uri: 'post\/{slug}',
            methods: ['GET', 'HEAD'],
            parameters: ['slug'],
        },
        'auth.google.redirect': {
            uri: 'auth\/google\/redirect',
            methods: ['GET', 'HEAD'],
        },
        'auth.google.callback': {
            uri: 'auth\/google\/callback',
            methods: ['GET', 'HEAD'],
        },
        'driver.trucks.list': {
            uri: 'driver\/trucks',
            methods: ['GET', 'HEAD'],
        },
        'education.index': { uri: 'education', methods: ['GET', 'HEAD'] },
        'finance.index': { uri: 'finance', methods: ['GET', 'HEAD'] },
        'agriculture.index': { uri: 'agriculture', methods: ['GET', 'HEAD'] },
        'construction.index': { uri: 'construction', methods: ['GET', 'HEAD'] },
        'fnb.public.menu': { uri: 'fnb\/menu', methods: ['GET', 'HEAD'] },
        'fnb.public.submit-order': {
            uri: 'api\/fnb-public\/customer-order',
            methods: ['POST'],
        },
        'pos-restaurant.kitchen-display': {
            uri: 'fnb\/kitchen-display\/{clientIdentifier}',
            methods: ['GET', 'HEAD'],
            parameters: ['clientIdentifier'],
        },
        'pos-restaurant.customer-display': {
            uri: 'fnb\/customer-display\/{clientIdentifier}',
            methods: ['GET', 'HEAD'],
            parameters: ['clientIdentifier'],
        },
        'pos-restaurant.kitchen-orders.update-status': {
            uri: 'fnb\/kitchen-orders\/{id}\/status',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'fnb.public.online-store': {
            uri: 'fnb\/store\/{domain}',
            methods: ['GET', 'HEAD'],
            parameters: ['domain'],
        },
        'fnb.public.online-store.menu': {
            uri: 'fnb\/store\/{domain}\/menu',
            methods: ['GET', 'HEAD'],
            parameters: ['domain'],
        },
        'fnb.public.online-store.order': {
            uri: 'fnb\/store\/{domain}\/order',
            methods: ['POST'],
            parameters: ['domain'],
        },
        'fnb.public.online-store.order-status': {
            uri: 'fnb\/store\/{domain}\/order\/{orderNumber}',
            methods: ['GET', 'HEAD'],
            parameters: ['domain', 'orderNumber'],
        },
        'pos-restaurant.public.reservation': {
            uri: 'pos-restaurant\/reservation',
            methods: ['GET', 'HEAD'],
        },
        'pos-restaurant.public.submit-reservation': {
            uri: 'api\/pos-restaurant-public\/reservation',
            methods: ['POST'],
        },
        'pos-restaurant.public.confirm-reservation': {
            uri: 'pos-restaurant\/reservation\/confirm\/{token}',
            methods: ['GET', 'HEAD'],
            parameters: ['token'],
        },
        pricing: { uri: 'pricing', methods: ['GET', 'HEAD'] },
        features: { uri: 'features', methods: ['GET', 'HEAD'] },
        'privacy-policy': {
            uri: 'policies\/privacy',
            methods: ['GET', 'HEAD'],
        },
        'terms-and-conditions': {
            uri: 'policies\/terms',
            methods: ['GET', 'HEAD'],
        },
        'cookie-policy': { uri: 'policies\/cookies', methods: ['GET', 'HEAD'] },
        faq: { uri: 'policies\/faq', methods: ['GET', 'HEAD'] },
        'manifest.member': {
            uri: 'manifest\/member\/{identifier}.json',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'manifest.content': {
            uri: 'manifest\/content\/{slug}.json',
            methods: ['GET', 'HEAD'],
            parameters: ['slug'],
        },
        'debug.auth': { uri: 'debug-auth', methods: ['GET', 'HEAD'] },
        'chat.login': { uri: 'chat\/login', methods: ['GET', 'HEAD'] },
        'chat.register': { uri: 'chat\/register', methods: ['GET', 'HEAD'] },
        community: { uri: 'community', methods: ['GET', 'HEAD'] },
        'community.about': {
            uri: 'community\/about',
            methods: ['GET', 'HEAD'],
        },
        'community.help': { uri: 'community\/help', methods: ['GET', 'HEAD'] },
        'community.search': {
            uri: 'community\/search',
            methods: ['GET', 'HEAD'],
        },
        'community.member': {
            uri: 'community\/member\/{identifier}',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'member.product.detail': {
            uri: 'm\/{identifier}\/product\/{productId}',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier', 'productId'],
        },
        'member.products.list': {
            uri: 'm\/{identifier}\/products',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'member.products.create': {
            uri: 'm\/{identifier}\/products',
            methods: ['POST'],
            parameters: ['identifier'],
        },
        'member.products.delete': {
            uri: 'm\/{identifier}\/products\/{productId}',
            methods: ['DELETE'],
            parameters: ['identifier', 'productId'],
        },
        'member.products.update': {
            uri: 'm\/{identifier}\/products\/{productId}',
            methods: ['PUT'],
            parameters: ['identifier', 'productId'],
        },
        'member.products.images.upload': {
            uri: 'm\/{identifier}\/products\/{productId}\/images',
            methods: ['POST'],
            parameters: ['identifier', 'productId'],
        },
        'member.products.images.delete': {
            uri: 'm\/{identifier}\/products\/{productId}\/images\/{imageId}',
            methods: ['DELETE'],
            parameters: ['identifier', 'productId', 'imageId'],
        },
        'member.products.orders': {
            uri: 'm\/{identifier}\/products\/{productId}\/orders',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier', 'productId'],
        },
        'member.checkout': {
            uri: 'm\/{identifier}\/checkout',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'member.cancel-order': {
            uri: 'm\/{identifier}\/cancel-order\/{orderId}',
            methods: ['POST'],
            parameters: ['identifier', 'orderId'],
        },
        'member.search-lending': {
            uri: 'm\/{identifier}\/search-lending',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'member.search-healthcare': {
            uri: 'm\/{identifier}\/search-healthcare',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'member.search-mortuary': {
            uri: 'm\/{identifier}\/search-mortuary',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'member.billers.list': {
            uri: 'm\/{identifier}\/billers',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'member.billers.favorite': {
            uri: 'm\/{identifier}\/billers\/{billerId}\/favorite',
            methods: ['POST'],
            parameters: ['identifier', 'billerId'],
        },
        'member.bill-payments.store': {
            uri: 'm\/{identifier}\/bill-payments',
            methods: ['POST'],
            parameters: ['identifier'],
        },
        'member.courses.list': {
            uri: 'm\/{identifier}\/courses',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'member.courses.categories': {
            uri: 'm\/{identifier}\/courses\/categories',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'member.courses.show': {
            uri: 'm\/{identifier}\/courses\/{courseId}',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier', 'courseId'],
        },
        'member.courses.lessons': {
            uri: 'm\/{identifier}\/courses\/{courseId}\/lessons',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier', 'courseId'],
        },
        'member.courses.learn': {
            uri: 'm\/{identifier}\/courses\/{courseId}\/learn',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier', 'courseId'],
        },
        'member.courses.lessons.api': {
            uri: 'm\/{identifier}\/courses\/{courseId}\/lessons\/api',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier', 'courseId'],
        },
        'member.courses.progress': {
            uri: 'm\/{identifier}\/courses\/progress\/{courseId}\/{contactId}',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier', 'courseId', 'contactId'],
        },
        'member.courses.check-enrollment': {
            uri: 'm\/{identifier}\/courses\/{courseId}\/check-enrollment',
            methods: ['POST'],
            parameters: ['identifier', 'courseId'],
        },
        'member.courses.lessons.start': {
            uri: 'm\/{identifier}\/courses\/enrollments\/{enrollmentId}\/progress\/{lessonId}\/start',
            methods: ['POST'],
            parameters: ['identifier', 'enrollmentId', 'lessonId'],
        },
        'member.courses.lessons.complete': {
            uri: 'm\/{identifier}\/courses\/enrollments\/{enrollmentId}\/progress\/{lessonId}\/complete',
            methods: ['POST'],
            parameters: ['identifier', 'enrollmentId', 'lessonId'],
        },
        'member.short': {
            uri: 'm\/{identifier}',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'api.send-signup-link': {
            uri: 'community\/send-signup-link',
            methods: ['POST'],
        },
        logistics: { uri: 'logistics', methods: ['GET', 'HEAD'] },
        'logistics.show': {
            uri: 'logistics\/{identifier}',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'logistics.trucks.list': {
            uri: 'logistics\/trucks\/list',
            methods: ['GET', 'HEAD'],
        },
        'logistics.users.search': {
            uri: 'logistics\/user\/search',
            methods: ['GET', 'HEAD'],
        },
        'logistics.bookings.list': {
            uri: 'logistics\/bookings\/list',
            methods: ['GET', 'HEAD'],
        },
        'logistics.bookings.stats': {
            uri: 'logistics\/bookings\/stats',
            methods: ['GET', 'HEAD'],
        },
        'logistics.bookings.store': {
            uri: 'logistics\/bookings\/store',
            methods: ['POST'],
        },
        'logistics.bookings.reference': {
            uri: 'logistics\/bookings\/reference',
            methods: ['GET', 'HEAD'],
        },
        'logistics.track': {
            uri: 'logistics\/{identifier}\/track',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'delivery.show': {
            uri: 'delivery\/{identifier}',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'jobs.show': {
            uri: 'jobs\/{identifier}',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'shop.show': {
            uri: 'shop\/{identifier}',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'admin.login': { uri: 'admin\/login', methods: ['GET', 'HEAD'] },
        'admin.login.attempt': { uri: 'admin\/login', methods: ['POST'] },
        'admin.logout': { uri: 'admin\/logout', methods: ['POST'] },
        'admin.dashboard': {
            uri: 'admin\/dashboard',
            methods: ['GET', 'HEAD'],
        },
        'admin.users.index': { uri: 'admin\/users', methods: ['GET', 'HEAD'] },
        'admin.users.create': {
            uri: 'admin\/users\/create',
            methods: ['GET', 'HEAD'],
        },
        'admin.users.store': { uri: 'admin\/users', methods: ['POST'] },
        'admin.users.edit': {
            uri: 'admin\/users\/{id}\/edit',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'admin.users.update': {
            uri: 'admin\/users\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'admin.users.destroy': {
            uri: 'admin\/users\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'admin.users.toggle-admin': {
            uri: 'admin\/users\/{id}\/toggle-admin',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'admin.users.resend-verification': {
            uri: 'admin\/users\/{id}\/resend-verification',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'admin.projects.index': {
            uri: 'admin\/projects',
            methods: ['GET', 'HEAD'],
        },
        'admin.projects.create': {
            uri: 'admin\/projects\/create',
            methods: ['GET', 'HEAD'],
        },
        'admin.projects.store': { uri: 'admin\/projects', methods: ['POST'] },
        'admin.projects.edit': {
            uri: 'admin\/projects\/{id}\/edit',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'admin.projects.update': {
            uri: 'admin\/projects\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'admin.projects.destroy': {
            uri: 'admin\/projects\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'admin.settings.index': {
            uri: 'admin\/settings',
            methods: ['GET', 'HEAD'],
        },
        'admin.settings.update': {
            uri: 'admin\/settings\/update',
            methods: ['POST'],
        },
        'admin.settings.registration': {
            uri: 'admin\/settings\/registration',
            methods: ['POST'],
        },
        'admin.settings.maintenance': {
            uri: 'admin\/settings\/maintenance',
            methods: ['POST'],
        },
        'admin.settings.ip-restriction': {
            uri: 'admin\/settings\/ip-restriction',
            methods: ['POST'],
        },
        'admin.subscriptions.index': {
            uri: 'admin\/subscriptions',
            methods: ['GET', 'HEAD'],
        },
        'admin.subscriptions.plans.store': {
            uri: 'admin\/subscriptions\/plans',
            methods: ['POST'],
        },
        'admin.subscriptions.plans.update': {
            uri: 'admin\/subscriptions\/plans\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'admin.subscriptions.plans.destroy': {
            uri: 'admin\/subscriptions\/plans\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'admin.subscriptions.plans.toggle-status': {
            uri: 'admin\/subscriptions\/plans\/{id}\/toggle-status',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'admin.subscriptions.view': {
            uri: 'admin\/subscriptions\/{id}',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'admin.subscriptions.cancel': {
            uri: 'admin\/subscriptions\/{id}\/cancel',
            methods: ['POST'],
            parameters: ['id'],
        },
        'admin.subscriptions.add-credits': {
            uri: 'admin\/subscriptions\/{id}\/add-credits',
            methods: ['POST'],
            parameters: ['id'],
        },
        'admin.subscriptions.mark-as-paid': {
            uri: 'admin\/subscriptions\/{id}\/mark-as-paid',
            methods: ['POST'],
            parameters: ['id'],
        },
        'admin.subscriptions.run-renewal': {
            uri: 'admin\/subscriptions\/run-renewal',
            methods: ['POST'],
        },
        'admin.apps.index': { uri: 'admin\/apps', methods: ['GET', 'HEAD'] },
        'admin.apps.create': {
            uri: 'admin\/apps\/create',
            methods: ['GET', 'HEAD'],
        },
        'admin.apps.store': { uri: 'admin\/apps', methods: ['POST'] },
        'admin.apps.edit': {
            uri: 'admin\/apps\/{index}\/edit',
            methods: ['GET', 'HEAD'],
            parameters: ['index'],
        },
        'admin.apps.update': {
            uri: 'admin\/apps\/{index}',
            methods: ['PUT'],
            parameters: ['index'],
        },
        'admin.apps.destroy': {
            uri: 'admin\/apps\/{index}',
            methods: ['DELETE'],
            parameters: ['index'],
        },
        'admin.apps.reorder': {
            uri: 'admin\/apps\/reorder',
            methods: ['POST'],
        },
        home: { uri: 'home', methods: ['GET', 'HEAD'] },
        help: { uri: 'help', methods: ['GET', 'HEAD'] },
        dashboard: { uri: 'dashboard', methods: ['GET', 'HEAD'] },
        'dashboard.gallery': { uri: 'dashboards', methods: ['GET', 'HEAD'] },
        'dashboard.store': { uri: 'dashboard', methods: ['POST'] },
        'dashboard.set-default': {
            uri: 'dashboard\/{dashboard}\/set-default',
            methods: ['POST'],
            parameters: ['dashboard'],
            bindings: { dashboard: 'id' },
        },
        'dashboard.toggle-star': {
            uri: 'dashboard\/{dashboard}\/toggle-star',
            methods: ['POST'],
            parameters: ['dashboard'],
            bindings: { dashboard: 'id' },
        },
        'dashboard.destroy': {
            uri: 'dashboard\/{dashboard}',
            methods: ['DELETE'],
            parameters: ['dashboard'],
            bindings: { dashboard: 'id' },
        },
        'dashboard.update': {
            uri: 'dashboard\/{dashboard}',
            methods: ['PATCH'],
            parameters: ['dashboard'],
            bindings: { dashboard: 'id' },
        },
        'dashboard.widgets': {
            uri: 'dashboard\/{dashboard}\/widgets',
            methods: ['GET', 'HEAD'],
            parameters: ['dashboard'],
            bindings: { dashboard: 'id' },
        },
        'widgets.store': { uri: 'widgets', methods: ['POST'] },
        'widgets.destroy': {
            uri: 'widgets\/{widget}',
            methods: ['DELETE'],
            parameters: ['widget'],
            bindings: { widget: 'id' },
        },
        'widgets.update': {
            uri: 'widgets\/{widget}',
            methods: ['PATCH'],
            parameters: ['widget'],
            bindings: { widget: 'id' },
        },
        'widgets.reorder': {
            uri: 'widgets\/{widget}\/reorder',
            methods: ['PATCH'],
            parameters: ['widget'],
            bindings: { widget: 'id' },
        },
        apps: { uri: 'apps', methods: ['GET', 'HEAD'] },
        'api.apps': { uri: 'api\/apps', methods: ['GET', 'HEAD'] },
        'api.apps.add': { uri: 'api\/apps\/add', methods: ['POST'] },
        'api.apps.add-multiple': {
            uri: 'api\/apps\/add-multiple',
            methods: ['POST'],
        },
        'api.apps.remove': { uri: 'api\/apps\/remove', methods: ['DELETE'] },
        'api.apps.billing-history': {
            uri: 'api\/apps\/billing-history',
            methods: ['GET', 'HEAD'],
        },
        'api.apps.invoice.pdf': {
            uri: 'api\/apps\/invoice\/{invoiceId}\/pdf',
            methods: ['GET', 'HEAD'],
            parameters: ['invoiceId'],
        },
        'api.apps.upcoming-invoices.pdf': {
            uri: 'api\/apps\/upcoming-invoices\/pdf',
            methods: ['GET', 'HEAD'],
        },
        'api.apps.billing-history.monthly.download': {
            uri: 'api\/apps\/billing-history\/monthly\/{monthKey}\/download',
            methods: ['GET', 'HEAD'],
            parameters: ['monthKey'],
        },
        'api.apps.toggle-auto-renew': {
            uri: 'api\/apps\/toggle-auto-renew',
            methods: ['POST'],
        },
        'api.apps.cancel-subscription': {
            uri: 'api\/apps\/cancel-subscription',
            methods: ['POST'],
        },
        'profile.edit': { uri: 'profile', methods: ['GET', 'HEAD'] },
        'profile.update': { uri: 'profile', methods: ['PATCH'] },
        'profile.destroy': { uri: 'profile', methods: ['DELETE'] },
        'profile.currency': { uri: 'profile\/currency', methods: ['PATCH'] },
        'profile.theme': { uri: 'profile\/theme', methods: ['PATCH'] },
        'profile.color': { uri: 'profile\/color', methods: ['PATCH'] },
        'profile.addresses.update': {
            uri: 'profile\/addresses',
            methods: ['POST'],
        },
        'queue.index': { uri: 'queue', methods: ['GET', 'HEAD'] },
        'queue.create': { uri: 'queue\/create', methods: ['GET', 'HEAD'] },
        'queue.store': { uri: 'queue', methods: ['POST'] },
        'queue.show': {
            uri: 'queue\/{id}',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'queue.edit': {
            uri: 'queue\/{id}\/edit',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'queue.update': {
            uri: 'queue\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'queue.destroy': {
            uri: 'queue\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'queue.numbers.list': {
            uri: 'queue\/numbers\/list',
            methods: ['GET', 'HEAD'],
        },
        'queue.create-number': {
            uri: 'queue\/numbers\/create',
            methods: ['POST'],
        },
        'queue.call-next': { uri: 'queue\/call-next', methods: ['POST'] },
        'queue.start-serving': {
            uri: 'queue\/{id}\/start-serving',
            methods: ['POST'],
            parameters: ['id'],
        },
        'queue.complete': {
            uri: 'queue\/{id}\/complete',
            methods: ['POST'],
            parameters: ['id'],
        },
        'queue.cancel': {
            uri: 'queue\/{id}\/cancel',
            methods: ['POST'],
            parameters: ['id'],
        },
        'queue.status': {
            uri: 'queue\/status\/overview',
            methods: ['GET', 'HEAD'],
        },
        'queue.display': { uri: 'queue-display', methods: ['GET', 'HEAD'] },
        'queue.display.status': {
            uri: 'queue-display\/status',
            methods: ['GET', 'HEAD'],
        },
        'queue.display.public': {
            uri: 'queue-display\/public\/{identifier}',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        clinic: { uri: 'clinic', methods: ['GET', 'HEAD'] },
        'clinic.inventory': {
            uri: 'clinic\/inventory',
            methods: ['GET', 'HEAD'],
        },
        'clinic.settings': {
            uri: 'clinic\/settings',
            methods: ['GET', 'HEAD'],
        },
        'clinic.settings.save': { uri: 'clinic\/settings', methods: ['POST'] },
        'contacts.index': { uri: 'contacts', methods: ['GET', 'HEAD'] },
        'contacts.create': {
            uri: 'contacts\/create',
            methods: ['GET', 'HEAD'],
        },
        'contacts.store': { uri: 'contacts', methods: ['POST'] },
        'contacts.show': {
            uri: 'contacts\/{contact}',
            methods: ['GET', 'HEAD'],
            parameters: ['contact'],
        },
        'contacts.edit': {
            uri: 'contacts\/{contact}\/edit',
            methods: ['GET', 'HEAD'],
            parameters: ['contact'],
        },
        'contacts.update': {
            uri: 'contacts\/{contact}',
            methods: ['PUT', 'PATCH'],
            parameters: ['contact'],
        },
        'contacts.destroy': {
            uri: 'contacts\/{contact}',
            methods: ['DELETE'],
            parameters: ['contact'],
        },
        'contacts.settings': {
            uri: 'contacts\/settings',
            methods: ['GET', 'HEAD'],
        },
        'contacts.wallet.balance': {
            uri: 'contacts\/{contactId}\/wallet\/balance',
            methods: ['GET', 'HEAD'],
            parameters: ['contactId'],
        },
        'contacts.wallet.add-funds': {
            uri: 'contacts\/{contactId}\/wallet\/add-funds',
            methods: ['POST'],
            parameters: ['contactId'],
        },
        'contacts.wallet.deduct-funds': {
            uri: 'contacts\/{contactId}\/wallet\/deduct-funds',
            methods: ['POST'],
            parameters: ['contactId'],
        },
        'contacts.wallet.transactions': {
            uri: 'contacts\/{contactId}\/wallet\/transactions',
            methods: ['GET', 'HEAD'],
            parameters: ['contactId'],
        },
        'contacts.wallets.client-summary': {
            uri: 'contacts\/wallets\/client-summary',
            methods: ['GET', 'HEAD'],
        },
        'contacts.wallets.transfer': {
            uri: 'contacts\/wallets\/transfer',
            methods: ['POST'],
        },
        'teams.index': { uri: 'teams', methods: ['GET', 'HEAD'] },
        'teams.create': { uri: 'teams\/create', methods: ['GET', 'HEAD'] },
        'teams.store': { uri: 'teams', methods: ['POST'] },
        'teams.show': {
            uri: 'teams\/{identifier}',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'teams.edit': {
            uri: 'teams\/{identifier}\/edit',
            methods: ['GET', 'HEAD'],
            parameters: ['identifier'],
        },
        'teams.update': {
            uri: 'teams\/{identifier}',
            methods: ['PUT'],
            parameters: ['identifier'],
        },
        'teams.destroy': {
            uri: 'teams\/{identifier}',
            methods: ['DELETE'],
            parameters: ['identifier'],
        },
        'teams.settings': { uri: 'teams\/settings', methods: ['GET', 'HEAD'] },
        'teams.list': { uri: 'teams\/list', methods: ['GET', 'HEAD'] },
        'teams.toggle-status': {
            uri: 'teams\/{identifier}\/toggle-status',
            methods: ['PATCH'],
            parameters: ['identifier'],
        },
        'teams.reset-password': {
            uri: 'teams\/{identifier}\/reset-password',
            methods: ['POST'],
            parameters: ['identifier'],
        },
        'team-member.password': {
            uri: 'teams\/password\/update',
            methods: ['GET', 'HEAD'],
        },
        'team-member.password.update': {
            uri: 'teams\/password\/update',
            methods: ['POST'],
        },
        'subscriptions.index': {
            uri: 'subscriptions',
            methods: ['GET', 'HEAD'],
        },
        'api.subscriptions.plans': {
            uri: 'api\/subscriptions\/plans',
            methods: ['GET', 'HEAD'],
        },
        'subscriptions.subscribe': {
            uri: 'subscriptions\/subscribe',
            methods: ['POST'],
        },
        'subscriptions.cancel': {
            uri: 'subscriptions\/cancel\/{identifier}',
            methods: ['POST'],
            parameters: ['identifier'],
        },
        'subscriptions.active': {
            uri: 'subscriptions\/{userIdentifier}\/active',
            methods: ['GET', 'HEAD'],
            parameters: ['userIdentifier'],
        },
        'subscriptions.history': {
            uri: 'subscriptions\/history\/{userIdentifier}',
            methods: ['GET', 'HEAD'],
            parameters: ['userIdentifier'],
        },
        'subscriptions.stripe.success': {
            uri: 'subscriptions\/stripe\/success',
            methods: ['GET', 'HEAD'],
        },
        'subscriptions.stripe.cancel': {
            uri: 'subscriptions\/stripe\/cancel',
            methods: ['GET', 'HEAD'],
        },
        'subscriptions.lemonsqueezy.success': {
            uri: 'subscriptions\/lemonsqueezy\/success',
            methods: ['GET', 'HEAD'],
        },
        'subscriptions.lemonsqueezy.cancel': {
            uri: 'subscriptions\/lemonsqueezy\/cancel',
            methods: ['GET', 'HEAD'],
        },
        'credits.buy': { uri: 'credits\/buy', methods: ['GET', 'HEAD'] },
        'credits.balance': {
            uri: 'credits\/{clientIdentifier}\/balance',
            methods: ['GET', 'HEAD'],
            parameters: ['clientIdentifier'],
        },
        'credits.request': { uri: 'credits\/request', methods: ['POST'] },
        'credits.history': {
            uri: 'credits\/{clientIdentifier}\/history',
            methods: ['GET', 'HEAD'],
            parameters: ['clientIdentifier'],
        },
        'credits.spent-history': {
            uri: 'credits\/{clientIdentifier}\/spent-history',
            methods: ['GET', 'HEAD'],
            parameters: ['clientIdentifier'],
        },
        'credits.spend': { uri: 'credits\/spend', methods: ['POST'] },
        'credits.payment.success': {
            uri: 'credits\/payment\/success',
            methods: ['GET', 'HEAD'],
        },
        'credits.payment.cancel': {
            uri: 'credits\/payment\/cancel',
            methods: ['GET', 'HEAD'],
        },
        'webhooks.stripe': { uri: 'webhooks\/stripe', methods: ['POST'] },
        'pos-retail': { uri: 'pos-retail', methods: ['GET', 'HEAD'] },
        'retail-sale': { uri: 'retail-sale', methods: ['GET', 'HEAD'] },
        'sales.destroy': {
            uri: 'retail-sale\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'sales.bulk-delete': {
            uri: 'retail-sales\/bulk-delete',
            methods: ['DELETE'],
        },
        'pos-restaurant': { uri: 'pos-restaurant', methods: ['GET', 'HEAD'] },
        'pos-restaurant.settings': {
            uri: 'pos-restaurant\/settings',
            methods: ['GET', 'HEAD'],
        },
        'pos-restaurant.settings.save': {
            uri: 'pos-restaurant\/settings',
            methods: ['POST'],
        },
        'pos-restaurant.tables.joined': {
            uri: 'pos-restaurant\/tables\/joined',
            methods: ['GET', 'HEAD'],
        },
        'pos-restaurant.tables.join': {
            uri: 'pos-restaurant\/tables\/join',
            methods: ['POST'],
        },
        'pos-restaurant.tables.unjoin': {
            uri: 'pos-restaurant\/tables\/unjoin',
            methods: ['POST'],
        },
        'pos-restaurant.add-item-to-order': {
            uri: 'pos-restaurant\/orders\/add-item',
            methods: ['POST'],
        },
        'pos-restaurant.remove-order-item': {
            uri: 'pos-restaurant\/current-order\/{table}\/item\/{id}',
            methods: ['DELETE'],
            parameters: ['table', 'id'],
        },
        'pos-restaurant.complete-order': {
            uri: 'pos-restaurant\/orders\/complete',
            methods: ['POST'],
        },
        'pos-restaurant.get-table-order': {
            uri: 'pos-restaurant\/table-order\/get',
            methods: ['POST'],
        },
        'pos-restaurant.save-table-order': {
            uri: 'pos-restaurant\/table-order\/save',
            methods: ['POST'],
        },
        'pos-restaurant.complete-table-order': {
            uri: 'pos-restaurant\/table-order\/complete',
            methods: ['POST'],
        },
        'pos-restaurant.all-active-orders': {
            uri: 'pos-restaurant\/table-orders\/all-active',
            methods: ['GET', 'HEAD'],
        },
        'pos-restaurant.customer-orders.pending': {
            uri: 'pos-restaurant\/customer-orders\/pending',
            methods: ['GET', 'HEAD'],
        },
        'pos-restaurant.customer-orders.update-status': {
            uri: 'pos-restaurant\/customer-orders\/{id}\/status',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'pos-restaurant.customer-orders.cancel': {
            uri: 'pos-restaurant\/customer-orders\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'pos-restaurant.kitchen-orders': {
            uri: 'pos-restaurant\/kitchen-orders',
            methods: ['GET', 'HEAD'],
        },
        'pos-restaurant.kitchen-orders.send': {
            uri: 'pos-restaurant\/kitchen-orders\/send',
            methods: ['POST'],
        },
        'pos-restaurant.kitchen-orders.complete': {
            uri: 'pos-restaurant\/kitchen-orders\/complete',
            methods: ['POST'],
        },
        'pos-restaurant.update-item-status': {
            uri: 'pos-restaurant\/update-item-status',
            methods: ['POST'],
        },
        inventory: { uri: 'inventory', methods: ['GET', 'HEAD'] },
        loan: { uri: 'loan', methods: ['GET', 'HEAD'] },
        'loan.settings': { uri: 'loan\/settings', methods: ['GET', 'HEAD'] },
        'loan.cbu.index': { uri: 'loan\/cbu', methods: ['GET', 'HEAD'] },
        'loan.cbu.settings': {
            uri: 'loan\/cbu\/settings',
            methods: ['GET', 'HEAD'],
        },
        'loan.cbu.store': { uri: 'loan\/cbu', methods: ['POST'] },
        'loan.cbu.update': {
            uri: 'loan\/cbu\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'loan.cbu.destroy': {
            uri: 'loan\/cbu\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'loan.cbu.contribution': {
            uri: 'loan\/cbu\/{id}\/contribution',
            methods: ['POST'],
            parameters: ['id'],
        },
        'loan.cbu.contributions': {
            uri: 'loan\/cbu\/{id}\/contributions',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'loan.cbu.withdrawals': {
            uri: 'loan\/cbu\/{id}\/withdrawals',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'loan.cbu.dividends': {
            uri: 'loan\/cbu\/{id}\/dividends',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'loan.cbu.dividend': {
            uri: 'loan\/cbu\/{id}\/dividend',
            methods: ['POST'],
            parameters: ['id'],
        },
        'loan.cbu.withdraw': {
            uri: 'loan\/cbu\/{id}\/withdraw',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'loan.cbu.withdraw.process': {
            uri: 'loan\/cbu\/{id}\/withdraw',
            methods: ['POST'],
            parameters: ['id'],
        },
        'loan.cbu.history': {
            uri: 'loan\/cbu\/{id}\/history',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'loan.cbu.report': {
            uri: 'loan\/cbu\/report',
            methods: ['GET', 'HEAD'],
        },
        'loan.cbu.send-report': {
            uri: 'loan\/cbu\/{id}\/send-report',
            methods: ['POST'],
            parameters: ['id'],
        },
        warehousing: { uri: 'warehousing', methods: ['GET', 'HEAD'] },
        transportation: { uri: 'transportation', methods: ['GET', 'HEAD'] },
        'transportation.fleet.list': {
            uri: 'transportation\/fleet\/list',
            methods: ['GET', 'HEAD'],
        },
        'transportation.fleet.stats': {
            uri: 'transportation\/fleet\/stats',
            methods: ['GET', 'HEAD'],
        },
        'transportation.fleet.locations': {
            uri: 'transportation\/fleet\/locations',
            methods: ['GET', 'HEAD'],
        },
        'transportation.fleet.real-time-locations': {
            uri: 'transportation\/fleet\/real-time-locations',
            methods: ['GET', 'HEAD'],
        },
        'transportation.fleet.store': {
            uri: 'transportation\/fleet',
            methods: ['POST'],
        },
        'transportation.fleet.show': {
            uri: 'transportation\/fleet\/{id}',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'transportation.fleet.update': {
            uri: 'transportation\/fleet\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'transportation.fleet.destroy': {
            uri: 'transportation\/fleet\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'transportation.fleet.fuel': {
            uri: 'transportation\/fleet\/{id}\/fuel',
            methods: ['POST'],
            parameters: ['id'],
        },
        'transportation.fleet.maintenance': {
            uri: 'transportation\/fleet\/{id}\/maintenance',
            methods: ['POST'],
            parameters: ['id'],
        },
        'transportation.fleet.location': {
            uri: 'transportation\/fleet\/{id}\/location',
            methods: ['POST'],
            parameters: ['id'],
        },
        'transportation.fleet.fuel-history': {
            uri: 'transportation\/fleet\/{id}\/fuel-history',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'transportation.fleet.maintenance-history': {
            uri: 'transportation\/fleet\/{id}\/maintenance-history',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'transportation.fleet.location-history': {
            uri: 'transportation\/fleet\/{id}\/location-history',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'transportation.shipments.list': {
            uri: 'transportation\/shipments\/list',
            methods: ['GET', 'HEAD'],
        },
        'transportation.shipments.stats': {
            uri: 'transportation\/shipments\/stats',
            methods: ['GET', 'HEAD'],
        },
        'transportation.shipments.store': {
            uri: 'transportation\/shipments',
            methods: ['POST'],
        },
        'transportation.shipments.show': {
            uri: 'transportation\/shipments\/{id}',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'transportation.shipments.update': {
            uri: 'transportation\/shipments\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'transportation.shipments.destroy': {
            uri: 'transportation\/shipments\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'transportation.shipments.status': {
            uri: 'transportation\/shipments\/{id}\/status',
            methods: ['POST'],
            parameters: ['id'],
        },
        'transportation.shipments.tracking-history': {
            uri: 'transportation\/shipments\/{id}\/tracking-history',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'transportation.cargo.list': {
            uri: 'transportation\/cargo\/list',
            methods: ['GET', 'HEAD'],
        },
        'transportation.cargo.stats': {
            uri: 'transportation\/cargo\/stats',
            methods: ['GET', 'HEAD'],
        },
        'transportation.cargo.store': {
            uri: 'transportation\/cargo',
            methods: ['POST'],
        },
        'transportation.cargo.show': {
            uri: 'transportation\/cargo\/{id}',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'transportation.cargo.update': {
            uri: 'transportation\/cargo\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'transportation.cargo.destroy': {
            uri: 'transportation\/cargo\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'transportation.cargo.status': {
            uri: 'transportation\/cargo\/{id}\/status',
            methods: ['POST'],
            parameters: ['id'],
        },
        'transportation.cargo.by-shipment': {
            uri: 'transportation\/cargo\/shipment\/{shipmentId}',
            methods: ['GET', 'HEAD'],
            parameters: ['shipmentId'],
        },
        'transportation.cargo.unloadings.list': {
            uri: 'transportation\/cargo\/{cargoItemId}\/unloadings',
            methods: ['GET', 'HEAD'],
            parameters: ['cargoItemId'],
        },
        'transportation.cargo.unloadings.store': {
            uri: 'transportation\/cargo\/{cargoItemId}\/unloadings',
            methods: ['POST'],
            parameters: ['cargoItemId'],
        },
        'transportation.cargo.unloadings.summary': {
            uri: 'transportation\/cargo\/{cargoItemId}\/unloadings\/summary',
            methods: ['GET', 'HEAD'],
            parameters: ['cargoItemId'],
        },
        'transportation.cargo.unloadings.show': {
            uri: 'transportation\/cargo\/{cargoItemId}\/unloadings\/{unloadingId}',
            methods: ['GET', 'HEAD'],
            parameters: ['cargoItemId', 'unloadingId'],
        },
        'transportation.cargo.unloadings.update': {
            uri: 'transportation\/cargo\/{cargoItemId}\/unloadings\/{unloadingId}',
            methods: ['PUT'],
            parameters: ['cargoItemId', 'unloadingId'],
        },
        'transportation.cargo.unloadings.destroy': {
            uri: 'transportation\/cargo\/{cargoItemId}\/unloadings\/{unloadingId}',
            methods: ['DELETE'],
            parameters: ['cargoItemId', 'unloadingId'],
        },
        'transportation.bookings.list': {
            uri: 'transportation\/bookings\/list',
            methods: ['GET', 'HEAD'],
        },
        'transportation.bookings.stats': {
            uri: 'transportation\/bookings\/stats',
            methods: ['GET', 'HEAD'],
        },
        'transportation.bookings.store': {
            uri: 'transportation\/bookings',
            methods: ['POST'],
        },
        'transportation.bookings.reference': {
            uri: 'transportation\/bookings\/reference',
            methods: ['GET', 'HEAD'],
        },
        'transportation.bookings.show': {
            uri: 'transportation\/bookings\/{id}',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'transportation.bookings.update': {
            uri: 'transportation\/bookings\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'transportation.bookings.destroy': {
            uri: 'transportation\/bookings\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'transportation.bookings.payment': {
            uri: 'transportation\/bookings\/{id}\/payment',
            methods: ['POST'],
            parameters: ['id'],
        },
        'transportation.pricing-configs.list': {
            uri: 'transportation\/pricing-configs\/list',
            methods: ['GET', 'HEAD'],
        },
        'transportation.pricing-configs.store': {
            uri: 'transportation\/pricing-configs',
            methods: ['POST'],
        },
        'transportation.pricing-configs.default': {
            uri: 'transportation\/pricing-configs\/default',
            methods: ['GET', 'HEAD'],
        },
        'transportation.pricing-configs.preview': {
            uri: 'transportation\/pricing-configs\/preview',
            methods: ['GET', 'HEAD'],
        },
        'transportation.pricing-configs.show': {
            uri: 'transportation\/pricing-configs\/{id}',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'transportation.pricing-configs.update': {
            uri: 'transportation\/pricing-configs\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'transportation.pricing-configs.destroy': {
            uri: 'transportation\/pricing-configs\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'transportation.settings': {
            uri: 'transportation\/settings',
            methods: ['GET', 'HEAD'],
        },
        'transportation.settings.save': {
            uri: 'transportation\/settings',
            methods: ['POST'],
        },
        'rental-items': { uri: 'rental-item', methods: ['GET', 'HEAD'] },
        'rental-item.settings': {
            uri: 'rental-item\/settings',
            methods: ['GET', 'HEAD'],
        },
        'rental-property': { uri: 'rental-property', methods: ['GET', 'HEAD'] },
        'rental-property.settings': {
            uri: 'rental-property\/settings',
            methods: ['GET', 'HEAD'],
        },
        payroll: { uri: 'payroll', methods: ['GET', 'HEAD'] },
        'payroll.settings': {
            uri: 'payroll\/settings',
            methods: ['GET', 'HEAD'],
        },
        'flight-search': { uri: 'flight-search', methods: ['GET', 'HEAD'] },
        flights: { uri: 'flights', methods: ['GET', 'HEAD'] },
        'sms.settings': { uri: 'sms\/settings', methods: ['GET', 'HEAD'] },
        'twilio-sms': { uri: 'sms-twilio', methods: ['GET', 'HEAD'] },
        'twilio-sms.send': { uri: 'sms-twilio\/send', methods: ['POST'] },
        'twilio-sms.balance': { uri: 'sms-twilio\/balance', methods: ['POST'] },
        'twilio-sms.status': {
            uri: 'sms-twilio\/status\/{messageId}',
            methods: ['POST'],
            parameters: ['messageId'],
        },
        'semaphore-sms': { uri: 'sms-semaphore', methods: ['GET', 'HEAD'] },
        'semaphore-sms.send': { uri: 'sms-semaphore\/send', methods: ['POST'] },
        'semaphore-sms.balance': {
            uri: 'sms-semaphore\/balance',
            methods: ['POST'],
        },
        'semaphore-sms.status': {
            uri: 'sms-semaphore\/status\/{messageId}',
            methods: ['POST'],
            parameters: ['messageId'],
        },
        'semaphore-sms.pricing': {
            uri: 'sms-semaphore\/pricing',
            methods: ['POST'],
        },
        'whatsapp-sms': { uri: 'sms-whatsapp', methods: ['GET', 'HEAD'] },
        'whatsapp-sms.send': { uri: 'sms-whatsapp\/send', methods: ['POST'] },
        'whatsapp-accounts.index': {
            uri: 'whatsapp-accounts',
            methods: ['GET', 'HEAD'],
        },
        'whatsapp-accounts.store': {
            uri: 'whatsapp-accounts',
            methods: ['POST'],
        },
        'whatsapp-accounts.update': {
            uri: 'whatsapp-accounts\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'whatsapp-accounts.destroy': {
            uri: 'whatsapp-accounts\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'whatsapp-accounts.test': {
            uri: 'whatsapp-accounts\/{id}\/test',
            methods: ['POST'],
            parameters: ['id'],
        },
        'whatsapp-accounts.templates.create': {
            uri: 'whatsapp-accounts\/templates',
            methods: ['POST'],
        },
        'whatsapp-accounts.templates.delete': {
            uri: 'whatsapp-accounts\/templates',
            methods: ['DELETE'],
        },
        'twilio-accounts.index': {
            uri: 'twilio-accounts',
            methods: ['GET', 'HEAD'],
        },
        'twilio-accounts.store': { uri: 'twilio-accounts', methods: ['POST'] },
        'twilio-accounts.update': {
            uri: 'twilio-accounts\/{twilioAccount}',
            methods: ['PUT'],
            parameters: ['twilioAccount'],
            bindings: { twilioAccount: 'id' },
        },
        'twilio-accounts.destroy': {
            uri: 'twilio-accounts\/{twilioAccount}',
            methods: ['DELETE'],
            parameters: ['twilioAccount'],
            bindings: { twilioAccount: 'id' },
        },
        'twilio-accounts.verify': {
            uri: 'twilio-accounts\/{twilioAccount}\/verify',
            methods: ['POST'],
            parameters: ['twilioAccount'],
            bindings: { twilioAccount: 'id' },
        },
        'twilio-accounts.toggle-active': {
            uri: 'twilio-accounts\/{twilioAccount}\/toggle-active',
            methods: ['POST'],
            parameters: ['twilioAccount'],
            bindings: { twilioAccount: 'id' },
        },
        'twilio-accounts.set-default': {
            uri: 'twilio-accounts\/{twilioAccount}\/set-default',
            methods: ['POST'],
            parameters: ['twilioAccount'],
            bindings: { twilioAccount: 'id' },
        },
        'twilio-accounts.unset-default': {
            uri: 'twilio-accounts\/{twilioAccount}\/unset-default',
            methods: ['POST'],
            parameters: ['twilioAccount'],
            bindings: { twilioAccount: 'id' },
        },
        'semaphore-accounts.index': {
            uri: 'semaphore-accounts',
            methods: ['GET', 'HEAD'],
        },
        'semaphore-accounts.store': {
            uri: 'semaphore-accounts',
            methods: ['POST'],
        },
        'semaphore-accounts.update': {
            uri: 'semaphore-accounts\/{semaphoreAccount}',
            methods: ['PUT'],
            parameters: ['semaphoreAccount'],
            bindings: { semaphoreAccount: 'id' },
        },
        'semaphore-accounts.destroy': {
            uri: 'semaphore-accounts\/{semaphoreAccount}',
            methods: ['DELETE'],
            parameters: ['semaphoreAccount'],
            bindings: { semaphoreAccount: 'id' },
        },
        'semaphore-accounts.toggle': {
            uri: 'semaphore-accounts\/{semaphoreAccount}\/toggle',
            methods: ['POST'],
            parameters: ['semaphoreAccount'],
            bindings: { semaphoreAccount: 'id' },
        },
        'semaphore-accounts.test': {
            uri: 'semaphore-accounts\/{semaphoreAccount}\/test',
            methods: ['POST'],
            parameters: ['semaphoreAccount'],
            bindings: { semaphoreAccount: 'id' },
        },
        'viber-sms': { uri: 'sms-viber', methods: ['GET', 'HEAD'] },
        'viber-sms.send': { uri: 'sms-viber\/send', methods: ['POST'] },
        'viber-accounts.index': {
            uri: 'viber-accounts',
            methods: ['GET', 'HEAD'],
        },
        'viber-accounts.store': { uri: 'viber-accounts', methods: ['POST'] },
        'viber-accounts.update': {
            uri: 'viber-accounts\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'viber-accounts.destroy': {
            uri: 'viber-accounts\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'viber-accounts.test': {
            uri: 'viber-accounts\/{id}\/test',
            methods: ['POST'],
            parameters: ['id'],
        },
        'email.index': { uri: 'email', methods: ['GET', 'HEAD'] },
        'email.settings': { uri: 'email\/settings', methods: ['GET', 'HEAD'] },
        'email.send': { uri: 'email\/send', methods: ['POST'] },
        'email.config': { uri: 'email\/config', methods: ['GET', 'HEAD'] },
        'email.templates.index': {
            uri: 'email\/templates',
            methods: ['GET', 'HEAD'],
        },
        'email.templates.list': {
            uri: 'email\/templates\/list',
            methods: ['GET', 'HEAD'],
        },
        'email.templates.create': {
            uri: 'email\/templates\/create',
            methods: ['GET', 'HEAD'],
        },
        'email.templates.store': { uri: 'email\/templates', methods: ['POST'] },
        'email.templates.show': {
            uri: 'email\/templates\/{template}',
            methods: ['GET', 'HEAD'],
            parameters: ['template'],
            bindings: { template: 'id' },
        },
        'email.templates.edit': {
            uri: 'email\/templates\/{template}\/edit',
            methods: ['GET', 'HEAD'],
            parameters: ['template'],
            bindings: { template: 'id' },
        },
        'email.templates.update': {
            uri: 'email\/templates\/{template}',
            methods: ['PUT'],
            parameters: ['template'],
            bindings: { template: 'id' },
        },
        'email.templates.destroy': {
            uri: 'email\/templates\/{template}',
            methods: ['DELETE'],
            parameters: ['template'],
            bindings: { template: 'id' },
        },
        'email.templates.preview': {
            uri: 'email\/templates\/{template}\/preview',
            methods: ['GET', 'HEAD'],
            parameters: ['template'],
            bindings: { template: 'id' },
        },
        'email.templates.toggle-status': {
            uri: 'email\/templates\/{template}\/toggle-status',
            methods: ['PATCH', 'POST'],
            parameters: ['template'],
            bindings: { template: 'id' },
        },
        genealogy: { uri: 'genealogy', methods: ['GET', 'HEAD'] },
        'genealogy.settings': {
            uri: 'genealogy\/settings',
            methods: ['GET', 'HEAD'],
        },
        'genealogy.settings.save': {
            uri: 'genealogy\/settings',
            methods: ['POST'],
        },
        'genealogy.members': {
            uri: 'genealogy\/members',
            methods: ['GET', 'HEAD'],
        },
        'genealogy.widget-stats': {
            uri: 'genealogy\/widget-stats',
            methods: ['GET', 'HEAD'],
        },
        'genealogy.members.store': {
            uri: 'genealogy\/members',
            methods: ['POST'],
        },
        'genealogy.members.update': {
            uri: 'genealogy\/members\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'genealogy.members.destroy': {
            uri: 'genealogy\/members\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'genealogy.relationships.add': {
            uri: 'genealogy\/relationships',
            methods: ['POST'],
        },
        'genealogy.relationships.remove': {
            uri: 'genealogy\/relationships\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'genealogy.export': {
            uri: 'genealogy\/export',
            methods: ['GET', 'HEAD'],
        },
        'genealogy.import': { uri: 'genealogy\/import', methods: ['POST'] },
        'genealogy.visualization': {
            uri: 'genealogy\/visualization',
            methods: ['GET', 'HEAD'],
        },
        'genealogy.edit-requests': {
            uri: 'genealogy\/edit-requests',
            methods: ['GET', 'HEAD'],
        },
        'genealogy.edit-requests.data': {
            uri: 'genealogy\/edit-requests\/data',
            methods: ['GET', 'HEAD'],
        },
        'genealogy.edit-requests.accept': {
            uri: 'genealogy\/edit-requests\/{id}\/accept',
            methods: ['POST'],
            parameters: ['id'],
        },
        'genealogy.edit-requests.reject': {
            uri: 'genealogy\/edit-requests\/{id}\/reject',
            methods: ['POST'],
            parameters: ['id'],
        },
        inbox: { uri: 'inbox', methods: ['GET', 'HEAD'] },
        'inbox.mark-as-read': {
            uri: 'inbox\/{id}\/read',
            methods: ['PATCH'],
            parameters: ['id'],
        },
        'inbox.delete': {
            uri: 'inbox\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'events.index': { uri: 'events', methods: ['GET', 'HEAD'] },
        'events.store': { uri: 'events', methods: ['POST'] },
        'events.update': {
            uri: 'events\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'events.destroy': {
            uri: 'events\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'events.create': { uri: 'events\/create', methods: ['GET', 'HEAD'] },
        'events.edit': {
            uri: 'events\/{id}\/edit',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'events.settings': {
            uri: 'events\/settings',
            methods: ['GET', 'HEAD'],
        },
        'events.calendar': {
            uri: 'events\/calendar',
            methods: ['GET', 'HEAD'],
        },
        'events.calendar-events': {
            uri: 'events\/calendar-events',
            methods: ['GET', 'HEAD'],
        },
        'events.participants.index': {
            uri: 'events\/{event}\/participants',
            methods: ['GET', 'HEAD'],
            parameters: ['event'],
        },
        'events.participants.register': {
            uri: 'events\/{event}\/participants',
            methods: ['POST'],
            parameters: ['event'],
        },
        'events.participants.unregister': {
            uri: 'events\/{event}\/participants\/{participant}',
            methods: ['DELETE'],
            parameters: ['event', 'participant'],
        },
        'events.participants.check-in': {
            uri: 'events\/{event}\/participants\/{participant}\/check-in',
            methods: ['POST'],
            parameters: ['event', 'participant'],
        },
        'events.participants.payment': {
            uri: 'events\/{event}\/participants\/{participant}\/payment',
            methods: ['PUT'],
            parameters: ['event', 'participant'],
        },
        'events.upcoming': {
            uri: 'events\/upcoming',
            methods: ['GET', 'HEAD'],
        },
        'events.past': { uri: 'events\/past', methods: ['GET', 'HEAD'] },
        'events.bulk-delete': { uri: 'events\/bulk-delete', methods: ['POST'] },
        'events.export': { uri: 'events\/export', methods: ['GET', 'HEAD'] },
        'events.import': { uri: 'events\/import', methods: ['POST'] },
        challenges: { uri: 'challenges', methods: ['GET', 'HEAD'] },
        'challenges.settings': {
            uri: 'challenges\/settings',
            methods: ['GET', 'HEAD'],
        },
        'challenges.list': {
            uri: 'challenges\/list',
            methods: ['GET', 'HEAD'],
        },
        'challenges.participants-list': {
            uri: 'challenges\/participants-list',
            methods: ['GET', 'HEAD'],
        },
        'challenges.store': { uri: 'challenges', methods: ['POST'] },
        'challenges.bulk-destroy': {
            uri: 'challenges\/bulk',
            methods: ['DELETE'],
        },
        'challenges.update': {
            uri: 'challenges\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'challenges.destroy': {
            uri: 'challenges\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'challenges.participants': {
            uri: 'challenges\/{id}\/participants',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'challenges.add-participant': {
            uri: 'challenges\/{id}\/participants',
            methods: ['POST'],
            parameters: ['id'],
        },
        'challenges.remove-participant': {
            uri: 'challenges\/{id}\/participants\/{participantId}',
            methods: ['DELETE'],
            parameters: ['id', 'participantId'],
        },
        'challenges.progress': {
            uri: 'challenges\/{id}\/progress',
            methods: ['POST'],
            parameters: ['id'],
        },
        'challenges.participation': {
            uri: 'challenges\/{id}\/participation',
            methods: ['PATCH'],
            parameters: ['id'],
        },
        'challenges.leaderboard': {
            uri: 'challenges\/{id}\/leaderboard',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'challenges.statistics': {
            uri: 'challenges\/{id}\/statistics',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'challenges.timer.start': {
            uri: 'challenges\/{id}\/timer\/start',
            methods: ['POST'],
            parameters: ['id'],
        },
        'challenges.timer.stop': {
            uri: 'challenges\/{id}\/timer\/stop',
            methods: ['POST'],
            parameters: ['id'],
        },
        'challenges.timer.pause': {
            uri: 'challenges\/{id}\/timer\/pause',
            methods: ['POST'],
            parameters: ['id'],
        },
        'challenges.timer.resume': {
            uri: 'challenges\/{id}\/timer\/resume',
            methods: ['POST'],
            parameters: ['id'],
        },
        'challenges.timer.reset': {
            uri: 'challenges\/{id}\/timer\/reset',
            methods: ['POST'],
            parameters: ['id'],
        },
        'challenges.timer.status': {
            uri: 'challenges\/{id}\/timer\/{participantId}\/status',
            methods: ['GET', 'HEAD'],
            parameters: ['id', 'participantId'],
        },
        'products.index': { uri: 'products', methods: ['GET', 'HEAD'] },
        'products.create': {
            uri: 'products\/create',
            methods: ['GET', 'HEAD'],
        },
        'products.store': { uri: 'products', methods: ['POST'] },
        'products.show': {
            uri: 'products\/{id}',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'products.edit': {
            uri: 'products\/{id}\/edit',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'products.update': {
            uri: 'products\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'products.destroy': {
            uri: 'products\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'products.settings': {
            uri: 'products\/settings',
            methods: ['GET', 'HEAD'],
        },
        'products.list': { uri: 'products\/list', methods: ['GET', 'HEAD'] },
        'products.download': {
            uri: 'products\/{id}\/download',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'products.update-stock': {
            uri: 'products\/{id}\/stock',
            methods: ['PATCH'],
            parameters: ['id'],
        },
        'products.categories': {
            uri: 'products\/categories',
            methods: ['GET', 'HEAD'],
        },
        'products.reviews': {
            uri: 'products\/{productId}\/reviews',
            methods: ['GET', 'HEAD'],
            parameters: ['productId'],
        },
        'products.reviews.store': {
            uri: 'products\/{productId}\/reviews',
            methods: ['POST'],
            parameters: ['productId'],
        },
        'products.reviews.vote': {
            uri: 'products\/{productId}\/reviews\/{reviewId}\/vote',
            methods: ['POST'],
            parameters: ['productId', 'reviewId'],
        },
        'products.reviews.destroy': {
            uri: 'products\/{productId}\/reviews\/{reviewId}',
            methods: ['DELETE'],
            parameters: ['productId', 'reviewId'],
        },
        'products.reviews.approve': {
            uri: 'products\/{productId}\/reviews\/{reviewId}\/approve',
            methods: ['POST'],
            parameters: ['productId', 'reviewId'],
        },
        'products.reviews.toggle-feature': {
            uri: 'products\/{productId}\/reviews\/{reviewId}\/toggle-feature',
            methods: ['POST'],
            parameters: ['productId', 'reviewId'],
        },
        'products.reviews.report': {
            uri: 'products\/{productId}\/reviews\/{reviewId}\/report',
            methods: ['POST'],
            parameters: ['productId', 'reviewId'],
        },
        'products.reported-reviews': {
            uri: 'product-review-reports\/reported-reviews',
            methods: ['GET', 'HEAD'],
        },
        'products.reports.status': {
            uri: 'product-review-reports\/reports\/{reportId}\/status',
            methods: ['PATCH'],
            parameters: ['reportId'],
        },
        'product-variants.index': {
            uri: 'products\/{productId}\/variants',
            methods: ['GET', 'HEAD'],
            parameters: ['productId'],
        },
        'product-variants.store': {
            uri: 'products\/{productId}\/variants',
            methods: ['POST'],
            parameters: ['productId'],
        },
        'product-variants.attributes': {
            uri: 'products\/{productId}\/variants\/attributes',
            methods: ['GET', 'HEAD'],
            parameters: ['productId'],
        },
        'product-variants.bulk-update': {
            uri: 'products\/{productId}\/variants\/bulk-update',
            methods: ['POST'],
            parameters: ['productId'],
        },
        'product-variants.show': {
            uri: 'products\/{productId}\/variants\/{variantId}',
            methods: ['GET', 'HEAD'],
            parameters: ['productId', 'variantId'],
        },
        'product-variants.update': {
            uri: 'products\/{productId}\/variants\/{variantId}',
            methods: ['PUT'],
            parameters: ['productId', 'variantId'],
        },
        'product-variants.destroy': {
            uri: 'products\/{productId}\/variants\/{variantId}',
            methods: ['DELETE'],
            parameters: ['productId', 'variantId'],
        },
        'product-variants.update-stock': {
            uri: 'products\/{productId}\/variants\/{variantId}\/stock',
            methods: ['PATCH'],
            parameters: ['productId', 'variantId'],
        },
        'product-orders.index': {
            uri: 'product-orders',
            methods: ['GET', 'HEAD'],
        },
        'product-orders.checkout': {
            uri: 'product-orders\/checkout',
            methods: ['GET', 'HEAD'],
        },
        'product-orders.store': { uri: 'product-orders', methods: ['POST'] },
        'product-orders.statistics': {
            uri: 'product-orders\/statistics',
            methods: ['GET', 'HEAD'],
        },
        'product-orders.list': {
            uri: 'product-orders\/list',
            methods: ['GET', 'HEAD'],
        },
        'product-orders.recent': {
            uri: 'product-orders\/recent',
            methods: ['GET', 'HEAD'],
        },
        'product-orders.show': {
            uri: 'product-orders\/{id}',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'product-orders.edit': {
            uri: 'product-orders\/{id}\/edit',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'product-orders.update': {
            uri: 'product-orders\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'product-orders.destroy': {
            uri: 'product-orders\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'product-orders.process-payment': {
            uri: 'product-orders\/{id}\/process-payment',
            methods: ['POST'],
            parameters: ['id'],
        },
        'product-orders.update-item-status': {
            uri: 'product-orders\/{orderId}\/items\/{productId}\/status',
            methods: ['PATCH'],
            parameters: ['orderId', 'productId'],
        },
        'courses.index': { uri: 'courses', methods: ['GET', 'HEAD'] },
        'courses.create': { uri: 'courses\/create', methods: ['GET', 'HEAD'] },
        'courses.store': { uri: 'courses', methods: ['POST'] },
        'courses.list': { uri: 'courses\/list', methods: ['GET', 'HEAD'] },
        'courses.categories': {
            uri: 'courses\/categories',
            methods: ['GET', 'HEAD'],
        },
        'courses.progress': {
            uri: 'courses\/progress\/{courseId}\/{contactId}',
            methods: ['GET', 'HEAD'],
            parameters: ['courseId', 'contactId'],
        },
        'courses.lessons.api': {
            uri: 'courses\/{id}\/lessons\/api',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'courses.show': {
            uri: 'courses\/{id}',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'courses.edit': {
            uri: 'courses\/{id}\/edit',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'courses.update': {
            uri: 'courses\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'courses.destroy': {
            uri: 'courses\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'courses.enroll': {
            uri: 'courses\/{id}\/enroll',
            methods: ['POST'],
            parameters: ['id'],
        },
        'courses.check-enrollment': {
            uri: 'courses\/{id}\/check-enrollment',
            methods: ['POST'],
            parameters: ['id'],
        },
        'courses.learn': {
            uri: 'courses\/{id}\/learn',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'courses.lessons': {
            uri: 'courses\/{id}\/lessons',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'courses.lessons.create': {
            uri: 'courses\/{id}\/lessons\/create',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'courses.lessons.store': {
            uri: 'courses\/{id}\/lessons',
            methods: ['POST'],
            parameters: ['id'],
        },
        'courses.lessons.edit': {
            uri: 'courses\/{id}\/lessons\/{lessonId}\/edit',
            methods: ['GET', 'HEAD'],
            parameters: ['id', 'lessonId'],
        },
        'courses.lessons.update': {
            uri: 'courses\/{id}\/lessons\/{lessonId}',
            methods: ['PUT'],
            parameters: ['id', 'lessonId'],
        },
        'courses.lessons.destroy': {
            uri: 'courses\/{id}\/lessons\/{lessonId}',
            methods: ['DELETE'],
            parameters: ['id', 'lessonId'],
        },
        'course-enrollments.progress.start': {
            uri: 'course-enrollments\/{enrollmentId}\/progress\/{lessonId}\/start',
            methods: ['POST'],
            parameters: ['enrollmentId', 'lessonId'],
        },
        'course-enrollments.progress.complete': {
            uri: 'course-enrollments\/{enrollmentId}\/progress\/{lessonId}\/complete',
            methods: ['POST'],
            parameters: ['enrollmentId', 'lessonId'],
        },
        'course-enrollments.certificate': {
            uri: 'course-enrollments\/{enrollmentId}\/certificate',
            methods: ['GET', 'HEAD'],
            parameters: ['enrollmentId'],
        },
        'course-enrollments.certificate.get': {
            uri: 'course-enrollments\/{enrollmentId}\/certificate\/get',
            methods: ['GET', 'HEAD'],
            parameters: ['enrollmentId'],
        },
        'content-creator.index': {
            uri: 'content-creator',
            methods: ['GET', 'HEAD'],
        },
        'content-creator.create': {
            uri: 'content-creator\/create',
            methods: ['GET', 'HEAD'],
        },
        'content-creator.store': { uri: 'content-creator', methods: ['POST'] },
        'content-creator.settings': {
            uri: 'content-creator\/settings',
            methods: ['GET', 'HEAD'],
        },
        'content-creator.list': {
            uri: 'content-creator\/list',
            methods: ['GET', 'HEAD'],
        },
        'content-creator.show': {
            uri: 'content-creator\/{id}',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'content-creator.edit': {
            uri: 'content-creator\/{id}\/edit',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'content-creator.update': {
            uri: 'content-creator\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'content-creator.destroy': {
            uri: 'content-creator\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'content-creator.update-status': {
            uri: 'content-creator\/{id}\/status',
            methods: ['PATCH'],
            parameters: ['id'],
        },
        'content-creator.preview': {
            uri: 'content-creator\/{id}\/preview',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'content-creator.bulk-destroy': {
            uri: 'content-creator\/bulk-delete',
            methods: ['POST'],
        },
        'pages.index': { uri: 'pages', methods: ['GET', 'HEAD'] },
        'pages.create': { uri: 'pages\/create', methods: ['GET', 'HEAD'] },
        'pages.store': { uri: 'pages', methods: ['POST'] },
        'pages.show': {
            uri: 'pages\/{page}',
            methods: ['GET', 'HEAD'],
            parameters: ['page'],
        },
        'pages.edit': {
            uri: 'pages\/{page}\/edit',
            methods: ['GET', 'HEAD'],
            parameters: ['page'],
        },
        'pages.update': {
            uri: 'pages\/{page}',
            methods: ['PUT', 'PATCH'],
            parameters: ['page'],
        },
        'pages.destroy': {
            uri: 'pages\/{page}',
            methods: ['DELETE'],
            parameters: ['page'],
        },
        'pages.settings': { uri: 'pages\/settings', methods: ['GET', 'HEAD'] },
        'pages.list': { uri: 'pages\/list', methods: ['GET', 'HEAD'] },
        'pages.duplicate': {
            uri: 'pages\/{id}\/duplicate',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'health-insurance': {
            uri: 'health-insurance',
            methods: ['GET', 'HEAD'],
        },
        'health-insurance.members.show': {
            uri: 'health-insurance\/members\/{id}',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'health-insurance.members.store': {
            uri: 'health-insurance\/members',
            methods: ['POST'],
        },
        'health-insurance.members.update': {
            uri: 'health-insurance\/members\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'health-insurance.members.delete': {
            uri: 'health-insurance\/members\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'health-insurance.contributions.bulk': {
            uri: 'health-insurance\/contributions\/bulk',
            methods: ['POST'],
        },
        'health-insurance.contributions.store': {
            uri: 'health-insurance\/contributions\/{memberId}',
            methods: ['POST'],
            parameters: ['memberId'],
        },
        'health-insurance.contributions.update': {
            uri: 'health-insurance\/contributions\/{memberId}\/{contributionId}',
            methods: ['PUT'],
            parameters: ['memberId', 'contributionId'],
        },
        'health-insurance.contributions.member': {
            uri: 'health-insurance\/contributions\/{memberId}',
            methods: ['GET', 'HEAD'],
            parameters: ['memberId'],
        },
        'health-insurance.contributions.delete': {
            uri: 'health-insurance\/contributions\/{memberId}\/{contributionId}',
            methods: ['DELETE'],
            parameters: ['memberId', 'contributionId'],
        },
        'health-insurance.claims.store': {
            uri: 'health-insurance\/claims\/{memberId}',
            methods: ['POST'],
            parameters: ['memberId'],
        },
        'health-insurance.claims.update': {
            uri: 'health-insurance\/claims\/{memberId}\/{claimId}',
            methods: ['PUT'],
            parameters: ['memberId', 'claimId'],
        },
        'health-insurance.claims.delete': {
            uri: 'health-insurance\/claims\/{memberId}\/{claimId}',
            methods: ['DELETE'],
            parameters: ['memberId', 'claimId'],
        },
        'health-insurance.claims.status': {
            uri: 'health-insurance\/claims\/{claimId}\/status',
            methods: ['PATCH'],
            parameters: ['claimId'],
        },
        'health-insurance.claims.member': {
            uri: 'health-insurance\/claims\/{memberId}',
            methods: ['GET', 'HEAD'],
            parameters: ['memberId'],
        },
        'health-insurance.report': {
            uri: 'health-insurance\/report',
            methods: ['POST'],
        },
        mortuary: { uri: 'mortuary', methods: ['GET', 'HEAD'] },
        'mortuary.members.show': {
            uri: 'mortuary\/members\/{id}',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'mortuary.members.store': {
            uri: 'mortuary\/members',
            methods: ['POST'],
        },
        'mortuary.members.update': {
            uri: 'mortuary\/members\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'mortuary.members.destroy': {
            uri: 'mortuary\/members\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'mortuary.contributions.bulk': {
            uri: 'mortuary\/contributions\/bulk',
            methods: ['POST'],
        },
        'mortuary.contributions.store': {
            uri: 'mortuary\/contributions\/{memberId}',
            methods: ['POST'],
            parameters: ['memberId'],
        },
        'mortuary.contributions.update': {
            uri: 'mortuary\/contributions\/{memberId}\/{contributionId}',
            methods: ['PUT'],
            parameters: ['memberId', 'contributionId'],
        },
        'mortuary.contributions.index': {
            uri: 'mortuary\/contributions\/{memberId}',
            methods: ['GET', 'HEAD'],
            parameters: ['memberId'],
        },
        'mortuary.contributions.destroy': {
            uri: 'mortuary\/contributions\/{memberId}\/{contributionId}',
            methods: ['DELETE'],
            parameters: ['memberId', 'contributionId'],
        },
        'mortuary.claims.store': {
            uri: 'mortuary\/claims\/{memberId}',
            methods: ['POST'],
            parameters: ['memberId'],
        },
        'mortuary.claims.update': {
            uri: 'mortuary\/claims\/{memberId}\/{claimId}',
            methods: ['PUT'],
            parameters: ['memberId', 'claimId'],
        },
        'mortuary.claims.status': {
            uri: 'mortuary\/claims\/{claimId}\/status',
            methods: ['PATCH'],
            parameters: ['claimId'],
        },
        'mortuary.claims.active-status': {
            uri: 'mortuary\/claims\/{claimId}\/active-status',
            methods: ['PATCH'],
            parameters: ['claimId'],
        },
        'mortuary.claims.index': {
            uri: 'mortuary\/claims\/{memberId}',
            methods: ['GET', 'HEAD'],
            parameters: ['memberId'],
        },
        'mortuary.claims.destroy': {
            uri: 'mortuary\/claims\/{memberId}\/{claimId}',
            methods: ['DELETE'],
            parameters: ['memberId', 'claimId'],
        },
        'mortuary.reports.generate': {
            uri: 'mortuary\/reports',
            methods: ['POST'],
        },
        'bill-payments': { uri: 'bill-payments', methods: ['GET', 'HEAD'] },
        'bill-payments.list': {
            uri: 'bill-payments\/list',
            methods: ['GET', 'HEAD'],
        },
        'bill-payments.billers': {
            uri: 'bill-payments\/billers',
            methods: ['GET', 'HEAD'],
        },
        'bill-payments.statistics': {
            uri: 'bill-payments\/statistics',
            methods: ['GET', 'HEAD'],
        },
        'bill-payments.overdue': {
            uri: 'bill-payments\/overdue',
            methods: ['GET', 'HEAD'],
        },
        'bill-payments.upcoming': {
            uri: 'bill-payments\/upcoming',
            methods: ['GET', 'HEAD'],
        },
        'bill-payments.store': { uri: 'bill-payments', methods: ['POST'] },
        'bill-payments.show': {
            uri: 'bill-payments\/{id}',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'bill-payments.update': {
            uri: 'bill-payments\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'bill-payments.destroy': {
            uri: 'bill-payments\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'bill-payments.bulk-update-status': {
            uri: 'bill-payments\/bulk-update-status',
            methods: ['POST'],
        },
        'bill-payments.bulk-delete': {
            uri: 'bill-payments\/bulk-delete',
            methods: ['POST'],
        },
        billers: { uri: 'billers', methods: ['GET', 'HEAD'] },
        'billers.list': { uri: 'billers\/list', methods: ['GET', 'HEAD'] },
        'billers.categories': {
            uri: 'billers\/categories',
            methods: ['GET', 'HEAD'],
        },
        'billers.store': { uri: 'billers', methods: ['POST'] },
        'billers.bulk-update-status': {
            uri: 'billers\/bulk-update-status',
            methods: ['POST'],
        },
        'billers.bulk-delete': {
            uri: 'billers\/bulk-delete',
            methods: ['POST'],
        },
        'billers.show': {
            uri: 'billers\/{id}',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'billers.update': {
            uri: 'billers\/{id}',
            methods: ['PUT'],
            parameters: ['id'],
        },
        'billers.destroy': {
            uri: 'billers\/{id}',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'kiosk.community.index': {
            uri: 'kiosk\/community',
            methods: ['GET', 'HEAD'],
        },
        'kiosk.community.data': {
            uri: 'kiosk\/community\/data',
            methods: ['GET', 'HEAD'],
        },
        'kiosk.community.events.participants': {
            uri: 'kiosk\/community\/events\/{eventId}\/participants',
            methods: ['GET', 'HEAD'],
            parameters: ['eventId'],
        },
        'kiosk.community.events.check-in': {
            uri: 'kiosk\/community\/events\/{eventId}\/participants\/{participantId}\/check-in',
            methods: ['POST'],
            parameters: ['eventId', 'participantId'],
        },
        'kiosk.community.health-insurance.contributions': {
            uri: 'kiosk\/community\/health-insurance\/contributions',
            methods: ['POST'],
        },
        'kiosk.community.mortuary.contributions': {
            uri: 'kiosk\/community\/mortuary\/contributions',
            methods: ['POST'],
        },
        'kiosk.community.search.members': {
            uri: 'kiosk\/community\/search\/members',
            methods: ['POST'],
        },
        'chat.index': { uri: 'chat', methods: ['GET', 'HEAD'] },
        'chat.create-conversation': {
            uri: 'chat\/conversations',
            methods: ['POST'],
        },
        'chat.send-message': { uri: 'chat\/messages', methods: ['POST'] },
        'chat.mark-read': { uri: 'chat\/mark-read', methods: ['POST'] },
        'chat.users': { uri: 'chat\/users', methods: ['GET', 'HEAD'] },
        'chat.show': {
            uri: 'chat\/{id}',
            methods: ['GET', 'HEAD'],
            parameters: ['id'],
        },
        'chat.debug-token': {
            uri: 'chat-debug-token',
            methods: ['GET', 'HEAD'],
        },
        register: { uri: 'register', methods: ['GET', 'HEAD'] },
        login: { uri: 'login', methods: ['GET', 'HEAD'] },
        'password.request': {
            uri: 'forgot-password',
            methods: ['GET', 'HEAD'],
        },
        'password.email': { uri: 'forgot-password', methods: ['POST'] },
        'password.reset': {
            uri: 'reset-password\/{token}',
            methods: ['GET', 'HEAD'],
            parameters: ['token'],
        },
        'password.store': { uri: 'reset-password', methods: ['POST'] },
        'verification.notice': {
            uri: 'verify-email',
            methods: ['GET', 'HEAD'],
        },
        'verification.verify': {
            uri: 'verify-email\/{id}\/{hash}',
            methods: ['GET', 'HEAD'],
            parameters: ['id', 'hash'],
        },
        'verification.send': {
            uri: 'email\/verification-notification',
            methods: ['POST'],
        },
        'password.confirm': {
            uri: 'confirm-password',
            methods: ['GET', 'HEAD'],
        },
        'password.update': { uri: 'password', methods: ['PUT'] },
        logout: { uri: 'logout', methods: ['POST'] },
        'team-member.select': {
            uri: 'team-member\/select',
            methods: ['GET', 'HEAD'],
        },
        'team-member.authenticate': {
            uri: 'team-member\/authenticate',
            methods: ['GET', 'HEAD'],
        },
        'team-member.authenticate.post': {
            uri: 'team-member\/authenticate',
            methods: ['POST'],
        },
        'team-member.switch': { uri: 'team-member\/switch', methods: ['POST'] },
        'team-member.clear': { uri: 'team-member\/clear', methods: ['POST'] },
        'storage.local': {
            uri: 'storage\/{path}',
            methods: ['GET', 'HEAD'],
            wheres: { path: '.*' },
            parameters: ['path'],
        },
    },
};
if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
    Object.assign(Ziggy.routes, window.Ziggy.routes);
}
export { Ziggy };
