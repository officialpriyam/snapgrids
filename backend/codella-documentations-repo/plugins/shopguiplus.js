module.exports = {
    name: 'ShopGUI+',
    description: 'Add shop gui to your server.',
    pluginId: 'ShopGUIPlus',
    mavenIntegration: 	`
    <repositories>
        <repository>
            <id>jitpack.io</id>
            <url>https://jitpack.io</url>
        </repository>
    </repositories>
    <dependency>
        <groupId>com.github.brcdev-minecraft</groupId>
        <artifactId>shopgui-api</artifactId>
        <version>3.0.0</version>
        <scope>provided</scope>
    </dependency>
    `,
    usage: `
        Hooking into ShopGUIPlus
        Do not hook into ShopGUIPlus directly in onEnable method of your plugin!
        
        Due to the way ShopGUIPlus loads up itself and dependant items from other plugins, at the point of onEnable you may get a NPE. It might work but it's considered as unsafe and we won't provide support if it doesn't. See example implementations below for more exact examples.
        
        Instead, listen for ShopGUIPlusPostEnableEvent event in your plugin and perform the startup logic there:
        
        To check if ShopGUIPlus is in the server, check this:
        if (Bukkit.getPluginManager().isPluginEnabled("ShopGUIPlus"))
        
        @EventHandler
        public void onShopGUIPlusPostEnable(ShopGUIPlusPostEnableEvent event){
            ShopGuiPlusApi.registerItemProvider(...);
        }
        This guarantees your code gets executed when ShopGUI+ had started up, but not loaded its shops yet, so you can register your items, spawners, economies etc. safely.
        
        When hooking into ShopGUIPlus, you can ensure it has loaded its items using following method:
        
        if (ShopGuiPlugin.getInstance().getShopManager().areShopsLoaded()) {
          // Shops are loaded at this point
        }
        ShopGuiPlusApi class: net.brcdev.shopgui
        Static Methods
        javastatic Shop getShop(String shopId)
        static void openMainMenu(Player player) throws PlayerDataNotLoadedException
        static void openShop(Player player, String shopId, int page) throws PlayerDataNotLoadedException
        static Shop getItemStackShop(Player player, ItemStack itemStack)
        static Shop getItemStackShop(ItemStack itemStack)
        static ShopItem getItemStackShopItem(Player player, ItemStack itemStack)
        static ShopItem getItemStackShopItem(ItemStack itemStack)
        static double getItemStackPriceBuy(Player player, ItemStack itemStack)
        static double getItemStackPriceBuy(ItemStack itemStack)
        static double getItemStackPriceSell(Player player, ItemStack itemStack)
        static double getItemStackPriceSell(ItemStack itemStack)
        static PriceModifier getPriceModifier(Player player, ShopItem shopItem, PriceModifierActionType type) throws PlayerDataNotLoadedException
        static void setPriceModifier(Player player, ShopItem shopItem, PriceModifierActionType type, double modifier) throws PlayerDataNotLoadedException
        static void resetPriceModifier(Player player, ShopItem shopItem, PriceModifierActionType type) throws PlayerDataNotLoadedException
        static PriceModifier getPriceModifier(Player player, Shop shop, PriceModifierActionType type) throws PlayerDataNotLoadedException
        static void setPriceModifier(Player player, Shop shop, PriceModifierActionType type, double modifier) throws PlayerDataNotLoadedException
        static void resetPriceModifier(Player player, Shop shop, PriceModifierActionType type) throws PlayerDataNotLoadedException
        static PriceModifier getPriceModifier(Player player, PriceModifierActionType type) throws PlayerDataNotLoadedException
        static void setPriceModifier(Player player, PriceModifierActionType type, double modifier) throws PlayerDataNotLoadedException
        static void resetPriceModifier(Player player, PriceModifierActionType type) throws PlayerDataNotLoadedException
        static void registerSpawnerProvider(ExternalSpawnerProvider spawnerProvider) throws ExternalSpawnerProviderNameConflictException
        static void registerEconomyProvider(EconomyProvider economyProvider)
        static void registerItemProvider(ItemProvider itemProvider)
        static ShopGuiPlugin getPlugin()
        ShopGuiPlugin class: net.brcdev.shopgui
        Public Methods
        javaBConfig getConfigMain()
        BConfig getConfigLang()
        BConfig getConfigPriceModifiers()
        BConfig getConfigShops()
        DataManager getDataManager()
        EconomyManager getEconomyManager()
        ItemManager getItemManager()
        PlayerManager getPlayerManager()
        PriceModifierManager getPriceModifierManager()
        ShopManager getShopManager()
        SpawnerManager getSpawnerManager()
        Shop class: net.brcdev.shopgui.shop
        Constructors
        javaShop(String id, String name, Map<Integer, String> namePerPage, int size, boolean enablePerItemPermissions, boolean denyDirectAccess, EconomyType economyType, ItemStack fillItem, List<String> worldsWhitelist, List<String> worldsBlacklist, List<ShopItem> shopItems)
        Public Methods
        javaString getId()
        void setId(String id)
        String getName()
        void setName(String name)
        Map<Integer, String> getNamePerPage()
        void setNamePerPage(Map<Integer, String> namePerPage)
        String getName(int page)
        int getSize()
        void setSize(int size)
        boolean isEnablePerItemPermissions()
        void setEnablePerItemPermissions(boolean enablePerItemPermissions)
        boolean isDenyDirectAccess()
        void setDenyDirectAccess(boolean denyDirectAccess)
        EconomyType getEconomyType()
        void setEconomyType(EconomyType economyType)
        ItemStack getFillItem()
        void setFillItem(ItemStack fillItem)
        List<String> getWorldsWhitelist()
        void setWorldsWhitelist(List<String> worldsWhitelist)
        List<String> getWorldsBlacklist()
        void setWorldsBlacklist(List<String> worldsBlacklist)
        List<ShopItem> getShopItems()
        void setShopItems(List<ShopItem> shopItems)
        ShopItem getShopItem(String itemId)
        ShopItem getShopItem(int page, int slot)
        GuiButton getButtonGoBack()
        void setButtonGoBack(GuiButton buttonGoBack)
        GuiButton getButtonPreviousPage()
        void setButtonPreviousPage(GuiButton buttonPreviousPage)
        GuiButton getButtonNextPage()
        void setButtonNextPage(GuiButton buttonNextPage)
        boolean hasAccess(Player player, ShopItem shopItem, boolean sendMessage)
        ShopItem findShopItem(Player player, PlayerData playerData, ItemStack itemStack, boolean excludeFreeItems)
        ShopItem findShopItem(ItemStack itemStack, boolean excludeFreeItems)
        EconomyProvider getEconomyProvider()
        ShopItem class: net.brcdev.shopgui.shop.item
        Constructors
        javaShopItem(Shop shop, String id, ShopItemType type)
        ShopItem(Shop shop, String id, ShopItemType type, ItemStack item)
        ShopItem(Shop shop, String id, ShopItemType type, ItemStack item, boolean unstack, boolean stacked, int page, double buyPrice, double sellPrice, int originalStackSize)
        ShopItem(Shop shop, String id, ShopItemType type, ItemStack item, boolean unstack, int page, int slot, double buyPrice, double sellPrice, int originalStackSize)
        ShopItem(ShopItem other)
        Public Methods
        javaShop getShop()
        void setShop(Shop shop)
        String getId()
        void setId(String id)
        ItemStack getItem()
        void setItem(ItemStack item)
        ItemStack getPlaceholder()
        void setPlaceholder(ItemStack placeholder)
        ShopItemType getType()
        void setType(ShopItemType type)
        int getPage()
        void setPage(int page)
        int getSlot()
        void setSlot(int slot)
        double getBuyPrice()
        void setBuyPrice(double buyPrice)
        @Deprecated double getBuyPrice(Player player, PlayerData playerData)
        double getBuyPrice(Player player)
        double getSellPrice()
        void setSellPrice(double sellPrice)
        @Deprecated double getSellPrice(Player player, PlayerData playerData)
        double getSellPrice(Player player)
        @Deprecated double getBuyPriceForAmount(Player player, PlayerData playerData, int amount)
        double getBuyPriceForAmount(Player player, int amount)
        double getBuyPriceForAmount(int amount)
        @Deprecated double getSellPriceForAmount(Player player, PlayerData playerData, int amount)
        double getSellPriceForAmount(Player player, int amount)
        double getSellPriceForAmount(int amount)
        ShopManager class: net.brcdev.shopgui.shop
        Public Methods
        javaSet<Shop> getShops() throws ShopsNotLoadedException
        boolean areShopsLoaded()
        void load()
        void openMainMenu(final Player player)
        void openShopMenu(Player player, String shopId, int page, boolean direct)
        ShopItem findShopItemByItemStack(Player player, ItemStack itemStack, boolean excludeFreeItems)
        ShopItem findShopItemByItemStack(ItemStack itemStack, boolean excludeFreeItems)
        Shop getShopById(String shopId)
        PlayerManager class: net.brcdev.shopgui.player
        Public Methods
        javaboolean isPlayerLoaded(OfflinePlayer player)
        PlayerData getPlayerData(OfflinePlayer player) throws PlayerDataNotLoadedException
        PlayerData class: net.brcdev.shopgui.player
        Public Methods
        javaUUID getId()
        String getName()
        CommandPriceModifiers getPriceModifiers()
        long getLastGuiClick()
        long getLastAmountSelectionGuiClick()
        OpenGui getOpenGui()
        boolean hasOpenGui()
        boolean isSwitchingGui()
        ItemManager class: net.brcdev.shopgui.item
        Public Methods
        javavoid registerDefaultItemProviders()
        void registerItemProvider(ItemProvider itemProvider)
        boolean areAllProvidersReady()
        ItemStack loadItem(ConfigurationSection configurationSection)
        boolean compare(ItemStack itemStack1, ItemStack itemStack2)
        void setup()
        EconomyManager class: net.brcdev.shopgui.economy
        Public Methods
        javavoid registerCustomEconomyProvider(EconomyProvider economyProvider)
        EconomyProvider getEconomyProvider(EconomyType economyType)
        EconomyProvider getDefaultEconomyProvider()
        SpawnerManager class: net.brcdev.shopgui.spawner
        Public Methods
        javaItemStack getSpawnerItem(EntityType entityType)
        EntityType getEntityType(ItemStack itemStack)
        void registerExternalSpawnerProvider(ExternalSpawnerProvider spawnerProvider)
        EconomyProvider abstract class: net.brcdev.shopgui.provider.economy
        Constructors
        javaEconomyProvider()
        Public Methods
        javaString getCurrencyPrefix()
        void setCurrencyPrefix(String currencyPrefix)
        String getCurrencySuffix()
        void setCurrencySuffix(String currencySuffix)
        abstract String getName()
        abstract double getBalance(Player player)
        abstract void deposit(Player player, double amount)
        abstract void withdraw(Player player, double amount)
        boolean has(Player player, double amount)
        ItemProvider abstract class: net.brcdev.shopgui.provider.item
        Constructors
        javaItemProvider(String name)
        Public Methods
        javaabstract boolean isValidItem(ItemStack itemStack)
        abstract ItemStack loadItem(ConfigurationSection configurationSection)
        abstract boolean compare(ItemStack itemStack1, ItemStack itemStack2)
        boolean isReady()
        String getName()
        boolean equals(Object o) (overrides)
        int hashCode() (overrides)
        EVENTS YOU CAN LISTEN TO:
        ShopGUIPlusPostEnableEvent abstract class: net.brcdev.shopgui.event
        Constructors
        javaShopGUIPlusPostEnableEvent()
        Static Methods
        javastatic HandlerList getHandlerList()
        Public Methods
        javaHandlerList getHandlers() (overrides)
        ShopPostTransactionEvent abstract class: net.brcdev.shopgui.event
        Static Methods
        javastatic HandlerList getHandlerList()
        Public Methods
        javaabstract HandlerList getHandlers()
        abstract ShopTransactionResult getResult()
        ShopPreTransactionEvent abstract class: net.brcdev.shopgui.event
        Static Methods
        javastatic HandlerList getHandlerList()
        Public Methods
        javaabstract boolean isCancelled() (overrides)
        abstract void setCancelled(boolean cancel) (overrides)
        HandlerList getHandlers() (overrides)
        abstract ShopItem getShopItem()
        abstract ShopAction getShopAction()
        abstract Player getPlayer()
        abstract int getAmount()
        abstract void setAmount(int amount)
        abstract double getPrice()
        abstract void setPrice(double price)
        ShopsPostLoadEvent abstract class: net.brcdev.shopgui.event
        Constructors
        javaShopsPostLoadEvent()
        Static Methods
        javastatic HandlerList getHandlerList()
        Public Methods
        javaHandlerList getHandlers() (overrides)
        Enumerations
        ShopItemType enum: net.brcdev.shopgui.shop.item
        ITEM
        PERMISSION
        ENCHANTMENT
        COMMAND
        SPECIAL
        SHOP_LINK
        DUMMY
        Enum Methods
        javastatic ShopItemType getType(String name)
        EconomyType enum: net.brcdev.shopgui.economy
        CUSTOM
        EXP
        MYSQL_TOKENS
        PLAYER_POINTS
        TOKEN_ENCHANT
        TOKEN_MANAGER
        VAULT
        ShopAction enum: net.brcdev.shopgui.shop (ShopManager.ShopAction)
        BUY
        SELL
        SELL_ALL
    
    `
};