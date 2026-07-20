module.exports = {
    name: 'RivalFishingRods',
    description: 'This plugin introduces a custom fishing rod that you will be able to enchant and farm with.',
    pluginId: 'RivalFishingRods',
    systemDownloadURL: 'https://raw.githubusercontent.com/CodellaAI/codella-documentations/main/lib/RivalFishingRods-API.jar',
    mavenIntegration: `
        <repositories>
            // SYSTEM DEPENDENCY NO REPOSITORY
        </repositories>
        <dependencies>
            <!-- RivalCredits main API -->
            <dependency>
                <groupId>me.rivaldev.fishingrod</groupId>
                <artifactId>rivalfishingrods</artifactId>
                <version>1.0</version>
                <scope>system</scope>
                <systemPath>\${basedir}/lib/RivalFishingRods-API.jar</systemPath>
            </dependency>
        </dependencies>
    `,
    usage: `
    This is an event-only API. If the user asks for adding certain functionality of this plugin that isn't events, tell them that you can't add that feature and list all the events you can listen to.

    KeyFinderChanceBoostEvent class: me.rivaldev.fishingrod.rivalfishingrods.api
    Extends: Event
    Constructor
    
    public KeyFinderChanceBoostEvent(Player player, double amount)
    
    Static Fields
    
    static final HandlerList HANDLERS
    
    Instance Methods
    
    HandlerList getHandlers()
    Player getPlayer()
    double getBoost()
    void setBoost(double amount)
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    RodAutoSellEvent class: me.rivaldev.fishingrod.rivalfishingrods.api
    Extends: Event
    Constructor
    
    public RodAutoSellEvent(Player player, List<String> message)
    
    Static Fields
    
    static final HandlerList HANDLERS
    
    Instance Methods
    
    HandlerList getHandlers()
    List<String> getMessage()
    void setMessage(List<String> message)
    Player getPlayer()
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    RodEnchantProcBoostEvent class: me.rivaldev.fishingrod.rivalfishingrods.api
    Extends: Event
    Constructor
    
    public RodEnchantProcBoostEvent(Player player, double amount)
    
    Static Fields
    
    static final HandlerList HANDLERS
    
    Instance Methods
    
    HandlerList getHandlers()
    Player getPlayer()
    double getBoost()
    void setBoost(double amount)
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    RodEssenceReceiveEvent class: me.rivaldev.fishingrod.rivalfishingrods.api
    Extends: Event
    Constructor
    
    public RodEssenceReceiveEvent(Player player, double amount)
    
    Static Fields
    
    static final HandlerList HANDLERS
    
    Instance Methods
    
    HandlerList getHandlers()
    Player getPlayer()
    double getEssence()
    void setEssence(double i)
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    RodMetaPreUpdateEvent class: me.rivaldev.fishingrod.rivalfishingrods.api
    Extends: Event
    Constructor
    
    public RodMetaPreUpdateEvent(Player player, List<String> lore, String name, ItemStack itemStack)
    
    Static Fields
    
    static final HandlerList HANDLERS
    
    Instance Methods
    
    HandlerList getHandlers()
    List<String> getLore()
    void setLore(List<String> lore)
    void setName(String name)
    String getName()
    ItemStack getItemStack()
    Player getPlayer()
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    RodMoneyReceiveEvent class: me.rivaldev.fishingrod.rivalfishingrods.api
    Extends: Event
    Constructor
    
    public RodMoneyReceiveEvent(Player player, double amount)
    
    Static Fields
    
    static final HandlerList HANDLERS
    
    Instance Methods
    
    HandlerList getHandlers()
    Player getPlayer()
    double getMoney()
    void setMoney(double i)
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    RodUpgradeMenuOpen class: me.rivaldev.fishingrod.rivalfishingrods.api
    Extends: Event
    Constructor
    
    public RodUpgradeMenuOpen(Player player, Inventory inventory)
    
    Static Fields
    
    static final HandlerList HANDLERS
    
    Instance Methods
    
    HandlerList getHandlers()
    Player getPlayer()
    Inventory getInventory()
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    RodXPGainEvent class: me.rivaldev.fishingrod.rivalfishingrods.api
    Extends: Event
    Constructor
    
    public RodXPGainEvent(Player player, double amount, NBTItem nbt)
    
    Static Fields
    
    static final HandlerList HANDLERS
    
    Instance Methods
    
    HandlerList getHandlers()
    Player getPlayer()
    double getXP()
    void setXP(double amount)
    NBTItem getNbt()
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    SpawnerFinderChanceBoostEvent class: me.rivaldev.fishingrod.rivalfishingrods.api
    Extends: Event
    Constructor
    
    public SpawnerFinderChanceBoostEvent(Player player, double amount)
    
    Static Fields
    
    static final HandlerList HANDLERS
    
    Instance Methods
    
    HandlerList getHandlers()
    Player getPlayer()
    double getBoost()
    void setBoost(double amount)
    
    Static Methods
    
    static HandlerList getHandlerList()
    `
};