module.exports = {
    name: 'AxGens',
    description: 'AxGens is a customizable generator plugin, done for Gens Tycoons servers.',
    pluginId: 'AxGens',
    mavenIntegration: `
        <repositories>
            <repository>
                <id>Artillex-Studios</id>
                <url>https://repo.artillex-studios.com/releases/</url>
            </repository>
        </repositories>
        <dependencies>
            <dependency>
                <groupId>com.artillexstudios</groupId>
                <artifactId>AxGensAPI</artifactId>
                <version>13</version>
                <scope>provided</scope>
            </dependency>
        </dependencies>
    `,
    usage: `
    AxGensAPI class: com.artillexstudios.axgens.api
    Static Methods
    
    static int getPlayerGeneratorLimit(OfflinePlayer player)
    static float getPlayerMultiplier(OfflinePlayer player)
    static int getGeneratorLimit(Player player)
    static int getPlayerGeneratorPlacedAmount(UUID uuid)
    static int getGeneratorPlacedAmount(UUID uuid)
    static long getLevel(UUID uuid)
    static void placeGenerator(Player player, Block block, Tier tier, ItemStack item, boolean corrupted, boolean force)
    static void damageBlock(Block block)
    static void damageBlock(Generator generator)
    static CurrencyHook getCurrency()
    static List<PricesHook> getShopPrices()
    static double getPrice(ItemStack it)
    static double getPrice(Player player, ItemStack it)
    static LevelsHook getLevels()
    static TeamHook getTeams()
    
    
    GeneratorArea class: com.artillexstudios.axgens.generators
    Static Fields
    
    static final ReentrantReadWriteLock lock
    static final ArrayList<ChunkPos> chunks
    
    Static Methods
    
    static void startTicking(Chunk chunk)
    static void stopTicking(Chunk chunk)
    static void load(Generator generator)
    static void remove(Generator generator)
    static List<Generator> getGenerators()
    static Generator getGeneratorAt(Location location)
    static void getChunks(Consumer<ArrayList<ChunkPos>> consumer)
    
    
    Generator class: com.artillexstudios.axgens.generators
    Constructor
    
    public Generator(int id, int tier, Location location, UUID owner, boolean broken)
    
    Static Fields
    
    static final Vector ZERO_VECTOR
    
    Instance Methods
    
    void tick()
    void tick(double multiplier)
    void updateTiers()
    void openGuiFor(Player player)
    void tryRepair(Player player)
    void tryUpgrade(Player player)
    void setId(int id)
    int getId()
    Location getLocation()
    int getTier()
    UUID getOwner()
    Tier getcTier()
    Tier getnTier()
    Generator getGenerator()
    boolean isOwnerOnline()
    Hologram getHologram()
    boolean isBroken()
    void setBroken(boolean broken)
    Hologram getBrokenHologram()
    boolean equals(Object o)
    int hashCode()
    String toString()
    
    
    Generators class: com.artillexstudios.axgens.generators
    Static Fields
    
    static final HashMap<Location, Generator> generators
    
    Static Methods
    
    static HashMap<Location, Generator> getGenerators()
    static void addGenerator(Generator generator)
    static void removeGenerator(Generator generator)
    static void removeGenerator(Location location)
    
    
    HookManager class: com.artillexstudios.axgens.hooks
    Static Fields
    
    static final HashSet<ProtectionHook> PROTECTION_HOOKS
    static CurrencyHook currency
    static final List<PricesHook> shopPrices
    static LevelsHook levels
    static TeamHook teams
    
    Instance Methods
    
    void setupHooks()
    void updateHooks()
    
    Static Methods
    
    static void registerProtectionHook(Plugin plugin, ProtectionHook protectionHook)
    static void registerPriceProviderHook(Plugin plugin, PricesHook pricesHook)
    static void registerCurrencyHook(Plugin plugin, CurrencyHook currencyHook)
    static void registerLevelHook(Plugin plugin, LevelsHook levelHook)
    static void registerTeamHook(Plugin plugin, TeamHook teamHook)
    static CurrencyHook getCurrency()
    static List<PricesHook> getShopPrices()
    static double getPrice(ItemStack it)
    static double getPrice(Player player, ItemStack it)
    static LevelsHook getLevels()
    static TeamHook getTeams()
    static boolean canBuildAt(Player player, Location location)
    
    
    TeamHook interface: com.artillexstudios.axgens.hooks.impl.team
    Instance Methods
    
    void setup()
    List<OfflinePlayer> getTeamMembersOf(OfflinePlayer player)
    
    
    PricesHook interface: com.artillexstudios.axgens.hooks.impl.shop
    Instance Methods
    
    void setup()
    double getPrice(ItemStack it)
    double getPrice(Player player, ItemStack it)
    
    
    LevelsHook interface: com.artillexstudios.axgens.hooks.impl.level
    Instance Methods
    
    void setup()
    long getLevel(Player player)
    
    
    ProtectionHook interface: com.artillexstudios.axgens.hooks.impl.protection
    Instance Methods
    
    boolean canPlayerBuildAt(Player player, Location location)
    
    
    CustomBlockHook interface: com.artillexstudios.axgens.hooks.impl.customblock
    Instance Methods
    
    void removeBlock(Location location)
    void placeBlock(String itemId, Location location)
    
    
    CurrencyHook interface: com.artillexstudios.axgens.hooks.impl.currency
    Instance Methods
    
    void setup()
    double getBalance(Player p)
    void giveBalance(Player p, double amount)
    void takeBalance(Player p, double amount)
    
    
    Tier class: com.artillexstudios.axgens.tiers
    Constructor
    
    public Tier(int tier, double price, long levelNeeded, int speed, ItemStack genItem, HashMap<ItemStack, Double> dropItems, boolean holoEnabled, double hologramHeight, List<String> holoLines, boolean hideFromShop)
    
    Instance Methods
    
    int getTier()
    double getPrice()
    long getLevelNeeded()
    int getSpeed()
    ItemStack getDropItem() (deprecated)
    ItemStack getFirstDropItem()
    HashMap<ItemStack, Double> getDropItems()
    ItemStack getRandomDropItem()
    ItemStack getGenItem()
    boolean isHoloEnabled()
    double getHologramHeight()
    boolean isHiddenFromShop()
    List<String> getHoloLines()
    
    
    Tiers class: com.artillexstudios.axgens.tiers
    Static Fields
    
    static final Int2ObjectLinkedOpenHashMap<Tier> tierMap
    static final HashMap<ItemStack, Double> priceMap
    
    Static Methods
    
    static Int2ObjectLinkedOpenHashMap<Tier> getTierMap()
    static HashMap<ItemStack, Double> getPriceMap()
    static Tier getTier(int tier)
    static Tier getTierNotNull(int tier)
    static void refreshTiers()
    
    
    Users class: com.artillexstudios.axgens.user
    Static Fields
    
    static final ConcurrentHashMap<UUID, AxGensUser> users
    
    Static Methods
    
    static AxGensUser getUser(UUID uuid)
    static AxGensUser getUser(Player player)
    
    
    AxGensUser class: com.artillexstudios.axgens.user
    Constructor
    
    public AxGensUser(UUID uuid)
    
    Instance Methods
    
    UUID getUuid()
    int getExtraSlots()
    void setExtraSlots(int extraSlots)
    int getPlaced()
    void setPlaced(int placed)
    void addPlaced(int amount)
    void addExtraSlots(int amount)
    float getMultiplier()
    void setMultiplier(float multiplier)
    long getLevel()
    void setLevel(long level)
    
    
    Sellwands class: com.artillexstudios.axgens.sellwand
    Static Fields
    
    static final HashMap<String, Sellwand> sellwands
    
    Static Methods
    
    static void reload()
    static HashMap<String, Sellwand> getSellwands()
    
    
    Sellwand class: com.artillexstudios.axgens.sellwand
    Constructor
    
    public Sellwand(String type, float multiplier, int uses, long cooldownMilis, Section section)
    
    Instance Methods
    
    String getType()
    float getMultiplier()
    int getUses()
    long getCooldownMilis()
    Section getItemSection()
    
    
    ChunkPos class: com.artillexstudios.axgens.utils
    Constructor
    
    public ChunkPos(World world, int x, int z)
    
    Instance Methods
    
    void addGenerator(Generator generator)
    boolean removeGenerator(Generator generator)
    int getX()
    int getZ()
    UUID getWorldUUID()
    ArrayList<Generator> getGenerators()
    boolean isTicking()
    void setTicking(boolean ticking)
    boolean equals(Object o)
    int hashCode()
    String toString()
    
    
    GeneratorUtils class: com.artillexstudios.axgens.utils
    Static Methods
    
    static int getMaxTier()
    static void removeGenerator(Player player, Generator generator)
    static void removeGenerator(Player player, Generator generator, Player giveTo)
    
    
    AxGensHookReloadEvent class: com.artillexstudios.axgens.api.events
    Extends: Event
    Static Fields
    
    static final HandlerList handlerList
    
    Instance Methods
    
    HandlerList getHandlers()
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    GeneratorDropEvent class: com.artillexstudios.axgens.api.events
    Extends: Event
    Implements: Cancellable
    Constructor
    
    public GeneratorDropEvent(Generator generator, ItemStack item)
    
    Static Fields
    
    static final HandlerList handlerList
    
    Instance Methods
    
    HandlerList getHandlers()
    Generator getGenerator()
    ItemStack getItem()
    void setItem(ItemStack item)
    boolean isCancelled()
    void setCancelled(boolean isCancelled)
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    GeneratorGuiOpenEvent class: com.artillexstudios.axgens.api.events
    Extends: Event
    Implements: Cancellable
    Constructor
    
    public GeneratorGuiOpenEvent(Player player, Generator generator)
    
    Static Fields
    
    static final HandlerList handlerList
    
    Instance Methods
    
    HandlerList getHandlers()
    Generator getGenerator()
    Player getPlayer()
    boolean isCancelled()
    void setCancelled(boolean isCancelled)
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    GeneratorInteractEvent class: com.artillexstudios.axgens.api.events
    Extends: Event
    Implements: Cancellable
    Constructor
    
    public GeneratorInteractEvent(Player player, Generator generator, PlayerInteractEvent playerInteractEvent)
    
    Static Fields
    
    static final HandlerList handlerList
    
    Instance Methods
    
    HandlerList getHandlers()
    Generator getGenerator()
    PlayerInteractEvent getPlayerInteractEvent()
    Player getPlayer()
    boolean isCancelled()
    void setCancelled(boolean isCancelled)
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    GeneratorLoadEvent class: com.artillexstudios.axgens.api.events
    Extends: Event
    Constructor
    
    public GeneratorLoadEvent(Generator generator)
    
    Static Fields
    
    static final HandlerList handlerList
    
    Instance Methods
    
    Generator getGenerator()
    HandlerList getHandlers()
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    GeneratorPickupEvent class: com.artillexstudios.axgens.api.events
    Extends: Event
    Implements: Cancellable
    Constructor
    
    public GeneratorPickupEvent(Player player, Generator generator)
    
    Static Fields
    
    static final HandlerList handlerList
    
    Instance Methods
    
    HandlerList getHandlers()
    Generator getGenerator()
    Player getPlayer()
    boolean isCancelled()
    void setCancelled(boolean isCancelled)
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    GeneratorPostPlaceEvent class: com.artillexstudios.axgens.api.events
    Extends: Event
    Constructor
    
    public GeneratorPostPlaceEvent(Player player, Generator generator, Block block)
    
    Static Fields
    
    static final HandlerList handlerList
    
    Instance Methods
    
    Generator getGenerator()
    Block getBlock()
    HandlerList getHandlers()
    Player getPlayer()
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    GeneratorPostPurchaseEvent class: com.artillexstudios.axgens.api.events
    Extends: Event
    Constructor
    
    public GeneratorPostPurchaseEvent(Player player, Tier tier, double price, long levelNeeded)
    
    Static Fields
    
    static final HandlerList handlerList
    
    Instance Methods
    
    HandlerList getHandlers()
    Player getPlayer()
    Tier getTier()
    double getPrice()
    long getLevelNeeded()
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    GeneratorPostUpgradeEvent class: com.artillexstudios.axgens.api.events
    Extends: Event
    Implements: Cancellable
    Constructor
    
    public GeneratorPostUpgradeEvent(Player player, Generator generator, Tier currentTier, Tier upgradedTier, double price, long levelNeeded)
    
    Static Fields
    
    static final HandlerList handlerList
    
    Instance Methods
    
    HandlerList getHandlers()
    Player getPlayer()
    Generator getGenerator()
    Tier getCurrentTier()
    Tier getUpgradedTier()
    double getPrice()
    long getLevelNeeded()
    boolean isCancelled()
    void setCancelled(boolean isCancelled)
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    GeneratorPrePlaceEvent class: com.artillexstudios.axgens.api.events
    Extends: Event
    Implements: Cancellable
    Constructor
    
    public GeneratorPrePlaceEvent(Player player, Block block, ItemStack item, int generatorTier)
    
    Static Fields
    
    static final HandlerList handlerList
    
    Instance Methods
    
    HandlerList getHandlers()
    Player getPlayer()
    Block getBlock()
    ItemStack getItem()
    int getGeneratorTier()
    boolean isCancelled()
    void setCancelled(boolean isCancelled)
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    GeneratorPreUpgradeEvent class: com.artillexstudios.axgens.api.events
    Extends: Event
    Implements: Cancellable
    Constructor
    
    public GeneratorPreUpgradeEvent(Player player, Generator generator, Tier currentTier, Tier upgradedTier, double price, long levelNeeded)
    
    Static Fields
    
    static final HandlerList handlerList
    
    Instance Methods
    
    HandlerList getHandlers()
    Player getPlayer()
    Generator getGenerator()
    Tier getCurrentTier()
    Tier getUpgradedTier()
    double getPrice()
    long getLevelNeeded()
    void setPrice(double price)
    void setLevelNeeded(int levelNeeded)
    boolean isCancelled()
    void setCancelled(boolean isCancelled)
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    GeneratorPrePurchaseEvent class: com.artillexstudios.axgens.api.events
    Extends: Event
    Implements: Cancellable
    Constructor
    
    public GeneratorPrePurchaseEvent(Player player, Tier tier, double price, long levelNeeded)
    
    Static Fields
    
    static final HandlerList handlerList
    
    Instance Methods
    
    HandlerList getHandlers()
    Player getPlayer()
    Tier getTier()
    double getPrice()
    long getLevelNeeded()
    void setPrice(double price)
    void setLevelNeeded(long levelNeeded)
    boolean isCancelled()
    void setCancelled(boolean isCancelled)
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    ItemSellEvent class: com.artillexstudios.axgens.api.events
    Extends: Event
    Constructor
    
    public ItemSellEvent(Player player, ItemStack soldItem, double money)
    
    Static Fields
    
    static final HandlerList handlerList
    
    Instance Methods
    
    HandlerList getHandlers()
    Player getPlayer()
    ItemStack getSoldItem()
    double getMoney()
    void setMoney(double money)
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    SellwandSellEvent class: com.artillexstudios.axgens.api.events
    Extends: Event
    Implements: Cancellable
    Constructor
    
    public SellwandSellEvent(Player player, double moneyMade, int itemsSold)
    
    Static Fields
    
    static final HandlerList handlerList
    
    Instance Methods
    
    HandlerList getHandlers()
    Player getPlayer()
    double getMoneyMade()
    int getItemsSold()
    boolean isCancelled()
    void setCancelled(boolean isCancelled)
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    UserLevelChangeEvent class: com.artillexstudios.axgens.api.events
    Extends: Event
    Constructor
    
    public UserLevelChangeEvent(OfflinePlayer player, long oldLevel, long newLevel)
    
    Static Fields
    
    static final HandlerList handlerList
    
    Instance Methods
    
    HandlerList getHandlers()
    OfflinePlayer getOfflinePlayer()
    Player getPlayer() (deprecated)
    long getOldLevel()
    long getNewLevel()
    
    Static Methods
    
    static HandlerList getHandlerList()
    `
};