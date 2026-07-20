module.exports = {
    name: 'EconomyShopGUI',
    description: 'A plugin to add shops to your server.',
    pluginId: 'EconomyShopGUI',
    mavenIntegration: `
        <repositories>
            <repository>
                <id>jitpack.io</id>
                <url>https://jitpack.io</url>
            </repository>
        </repositories>
        <dependencies>
            <dependency>
                <groupId>com.github.Gypopo</groupId>
                <artifactId>EconomyShopGUI-API</artifactId>
                <version>1.8.0</version>
                <scope>provided</scope>
            </dependency>
        </dependencies>
    `,
    usage: `
        When integrated with the API, calling methods is as simple as:
    
        EconomyShopGUIHook.someMethod();
        
        MAIN Package: me.gypopo.economyshopgui.api
        Example 01: Check if EconomyShopGUI is enabled and get basic item prices.
        javapublic boolean isEconomyShopGUIEnabled() {
            PluginManager pluginManager = Bukkit.getPluginManager();
            return pluginManager.isPluginEnabled("EconomyShopGUI");
        }
        
        public ShopItem getShopItemForItemStack(Player player, ItemStack item) {
            return EconomyShopGUIHook.getShopItem(player, item);
        }
        
        public double getItemBuyPrice(Player player, ItemStack item) {
            ShopItem shopItem = EconomyShopGUIHook.getShopItem(player, item);
            if (shopItem != null) {
                return EconomyShopGUIHook.getItemBuyPrice(shopItem, player, item.getAmount());
            }
            return -1.0;
        }
        EconomyShopGUIHook class: me.gypopo.economyshopgui.api
        Constructors
        javaEconomyShopGUIHook()
        Static Methods
        javastatic boolean isSellAble(ShopItem shopItem)
        @Nullable @Deprecated static Double getItemSellPrice(ItemStack item)
        @Nullable @Deprecated static Double getItemSellPrice(Player player, ItemStack item)
        @Nullable @Deprecated static Double getItemBuyPrice(ItemStack item)
        @Nullable @Deprecated static Double getItemBuyPrice(Player player, ItemStack item)
        static Double getItemSellPrice(ShopItem shopItem, ItemStack item)
        static Double getItemSellPrice(ShopItem shopItem, ItemStack item, Player player)
        static Double getItemSellPrice(ShopItem shopItem, ItemStack item, Player player, int amount, int sold)
        static Double getItemSellPrice(ShopItem shopItem, ItemStack item, int amount, int sold)
        static Optional<SellPrice> getSellPrice(OfflinePlayer player, ItemStack item)
        static SellPrices getSellPrices(OfflinePlayer player, ItemStack... items)
        static SellPrices getCutSellPrices(OfflinePlayer player, ItemStack[] items, boolean allowModify)
        static boolean isBuyAble(ShopItem shopItem)
        @Deprecated static Double getItemBuyPrice(ShopItem shopItem, ItemStack item)
        @Deprecated static Double getItemBuyPrice(ShopItem shopItem, ItemStack item, Player player)
        static double getItemBuyPrice(ShopItem shopItem, int amount)
        static double getItemBuyPrice(ShopItem shopItem, Player player, int amount)
        static Optional<BuyPrice> getBuyPrice(OfflinePlayer player, ItemStack item)
        static boolean hasMultipleBuyPrices(ShopItem shopItem)
        static AdvancedBuyPrice getMultipleBuyPrices(ShopItem shopItem)
        static boolean hasMultipleSellPrices(ShopItem shopItem)
        static AdvancedSellPrice getMultipleSellPrices(ShopItem shopItem)
        static EconomyProvider getEcon(@Nullable EcoType ecoType)
        @Deprecated static void buyItem(ItemStack item, int amount)
        @Deprecated static void sellItem(ItemStack item, int amount)
        static void buyItem(ShopItem shopItem, int amount)
        static void sellItem(ShopItem shopItem, int amount)
        @Nullable static ShopItem getShopItem(ItemStack item)
        @Nullable static ShopItem getShopItem(Player player, ItemStack item)
        @Nullable static ShopItem getShopItem(String itemPath)
        @Nullable static ShopSection getShopSection(String section)
        static List<String> getShopSections()
        static Map<String, ShopSection> getSections()
        static int getItemStock(ShopItem shopItem, @Nullable UUID uuid)
        static Long getItemStockRestockTime(ShopItem shopItem, @Nullable UUID uuid)
        static int buyItemStock(ShopItem shopItem, @Nullable UUID uuid, int amount)
        static void sellItemStock(ShopItem shopItem, @Nullable UUID uuid, int amount)
        static int getSellLimit(ShopItem shopItem, @Nullable UUID uuid)
        static Long getSellLimitRestockTime(ShopItem shopItem, @Nullable UUID uuid)
        static int sellItemLimit(ShopItem shopItem, @Nullable UUID uuid, int amount)
        static boolean hasPermissions(ShopItem shopItem, Player player)
        static boolean hasPermissions(ShopItem shopItem, Player player, String root)
        BuyPrice class: me.gypopo.economyshopgui.api.objects
        Constructors
        javaBuyPrice(OfflinePlayer player, int amount, ShopItem shopItem, Map<EcoType, Double> prices)
        BuyPrice(OfflinePlayer player, int amount, ShopItem shopItem, EcoType ecoType, double price)
        Public Methods
        javaOfflinePlayer getPlayer()
        int getAmount()
        ShopItem getShopItem()
        Map<EcoType, Double> getPrices()
        double getPrice(EcoType ecoType)
        BuyPrice updateLimits()
        SellPrice class: me.gypopo.economyshopgui.api.objects
        Constructors
        javaSellPrice(OfflinePlayer player, int amount, ShopItem shopItem, Map<EcoType, Double> prices)
        SellPrice(OfflinePlayer player, int amount, ShopItem shopItem, EcoType ecoType, double price)
        Public Methods
        javaOfflinePlayer getPlayer()
        int getAmount()
        ShopItem getShopItem()
        Map<EcoType, Double> getPrices()
        double getPrice(EcoType ecoType)
        SellPrice updateLimits()
        SellPrices class: me.gypopo.economyshopgui.api.objects
        Constructors
        javaSellPrices(OfflinePlayer player, Map<ShopItem, Integer> items, Map<EcoType, Double> prices)
        Public Methods
        javaOfflinePlayer getPlayer()
        Map<ShopItem, Integer> getItems()
        Map<EcoType, Double> getPrices()
        double getPrice(EcoType ecoType)
        boolean isEmpty()
        SellPrices updateLimits()
        AdvancedBuyPrice class: me.gypopo.economyshopgui.api.prices
        Constructors
        javaAdvancedBuyPrice(ShopItem shopItem)
        Public Methods
        javaList<EcoType> getBuyTypes()
        boolean isBuyAble()
        boolean requireAll()
        Map<EcoType, Double> getBuyPrices(@Nullable EcoType ecoType, int amount)
        Map<EcoType, Double> getBuyPrices(@Nullable EcoType ecoType, Player player, int amount)
        AdvancedSellPrice class: me.gypopo.economyshopgui.api.prices
        Constructors
        javaAdvancedSellPrice(ShopItem shopItem)
        Public Methods
        javaList<EcoType> getSellTypes()
        boolean isSellAble()
        boolean giveAll()
        Map<EcoType, Double> getSellPrices(@Nullable EcoType ecoType, ItemStack item)
        Map<EcoType, Double> getSellPrices(@Nullable EcoType ecoType, ItemStack item, int amount, int sold)
        Map<EcoType, Double> getSellPrices(@Nullable EcoType ecoType, Player player, ItemStack item)
        Map<EcoType, Double> getSellPrices(@Nullable EcoType ecoType, Player player, ItemStack item, int amount, int sold)
        EVENTS YOU CAN LISTEN TO:
        PreTransactionEvent class: me.gypopo.economyshopgui.api.events
        Constructors
        javaPreTransactionEvent(ShopItem shopItem, Player player, int amount, double price, Transaction.Type transactionType)
        PreTransactionEvent(Map<ShopItem, Integer> items, Map<EcoType, Double> prices, Player player, int amount, Transaction.Type transactionType)
        Public Methods
        javaboolean isCancelled() (overrides)
        void setCancelled(boolean cancel) (overrides)
        int getAmount()
        double getPrice()
        double getOriginalPrice()
        Map<EcoType, Double> getPrices()
        Map<EcoType, Double> getOriginalPrices()
        void setPrice(double price)
        @Deprecated ItemStack getItemStack()
        ShopItem getShopItem()
        Map<ShopItem, Integer> getItems()
        Player getPlayer()
        Transaction.Type getTransactionType()
        PostTransactionEvent class: me.gypopo.economyshopgui.api.events
        Constructors
        javaPostTransactionEvent(ShopItem shopItem, Player player, int amount, double price, Transaction.Type type, Transaction.Result result)
        PostTransactionEvent(Map<ShopItem, Integer> items, Map<EcoType, Double> prices, Player player, int amount, Transaction.Type type, Transaction.Result result)
        Public Methods
        javaint getAmount()
        double getPrice()
        Map<EcoType, Double> getPrices()
        @Deprecated ItemStack getItemStack()
        ShopItem getShopItem()
        Map<ShopItem, Integer> getItems()
        Player getPlayer()
        Transaction.Type getTransactionType()
        Transaction.Result getTransactionResult()
        ShopItemsLoadEvent class: me.gypopo.economyshopgui.api.events
        Constructors
        javaShopItemsLoadEvent()
        
    `
};