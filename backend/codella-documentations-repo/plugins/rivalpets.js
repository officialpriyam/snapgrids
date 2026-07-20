module.exports = {
    name: 'RivalPets',
    description: 'Floating heads pet plugin..',
    pluginId: 'RivalPets',
    systemDownloadURL: 'https://raw.githubusercontent.com/CodellaAI/codella-documentations/main/lib/RivalPets-API.jar',
    mavenIntegration: `
        <repositories>
            // SYSTEM DEPENDENCY NO REPOSITORY
        </repositories>
        <dependencies>
            <!-- RivalCredits main API -->
            <dependency>
                <groupId>me.rivaldev.rivalpets</groupId>
                <artifactId>api</artifactId>
                <version>1.0</version>
                <scope>system</scope>
                <systemPath>\${basedir}/lib/RivalPets-API.jar</systemPath>
            </dependency>
        </dependencies>
    `,
    usage: `
    RivalPetsAPI class: me.rivaldev.rivalpets.api
    Static Fields
    
    static RivalPetsAPI api
    
    Instance Methods
    
    void addExperience(Player var1, String var2)
    boolean hasBuff(Player var1, String var2)
    double getBuffBoost(Player var1, String var2)
    String getBuffPercentage(Player var1, String var2)
    void registerBuff(PetBuffRegister var1)
    void registerUpgrade(PetUpgradeRegister var1, String var2, String var3)
    long getUpgradeLevel(Player var1, String var2)
    void registerBuff(PetBuffRegister var1, String var2)
    ItemStack getCandyItem(String var1)
    ActivatedPet activatePet(UUID var1, RPet var2, UUID var3)
    int getPetStorage(Player var1)
    int getPetSlot(Player var1, UUID var2)
    int getOnlyPetSlots(Player var1)
    int getPetSlots(Player var1)
    boolean isOwnerScroll(ItemStack var1)
    boolean isCandyItem(ItemStack var1)
    boolean isLevelItem(ItemStack var1)
    long LevelItemAmount(ItemStack var1)
    boolean isRarityItem(ItemStack var1)
    String getCandyName(ItemStack var1)
    boolean isPetItem(ItemStack var1)
    String getPetBoxName(ItemStack var1)
    boolean isPetBox(ItemStack var1)
    UUID getPetUUID(ItemStack var1)
    RPet getRPetByItem(ItemStack var1)
    RPet getRPetByString(String var1)
    boolean isVanished(Player var1)
    StoredPet getStoredPetByItem(ItemStack var1)
    
    Static Methods
    
    static RivalPetsAPI getApi()
    
    
    ActivatedPet class: me.rivaldev.rivalpets.handlers
    Implements: Serializable
    Constructors
    
    public ActivatedPet(UUID var1, RPet var2)
    public ActivatedPet(UUID var1, RPet var2, UUID var3)
    
    Static Fields
    
    static final double DEG_TO_RAD
    
    Instance Methods
    
    void loadChunk()
    OfflinePlayer getOfflinePlayer()
    Player getPlayer()
    boolean isPlayerOnline()
    Location getLocation()
    void addCooldown(int var1)
    long getCooldown()
    boolean isOnCooldown()
    void toggle()
    void toggleSilent()
    void respawn(int var1)
    void activate(boolean var1)
    void activate()
    void deactivateForce()
    void deactivate(boolean var1)
    void deactivate()
    void addLevel(int var1)
    void addEXPNoEvent(double var1)
    void addEXP(double var1)
    void addExperience(double var1)
    double getNeededExperience()
    void teleportStands()
    void createArmorStands()
    void setPetVisually()
    void start()
    void clear()
    void setVisible(boolean var1)
    void updateYaw()
    void checkVisiblity()
    void refreshVisibility()
    void setDistance()
    void updateName()
    void checkDeactivation()
    UUID getOwner()
    RPet getPet()
    void setPet(RPet var1)
    UUID getPetUUID()
    boolean isActive()
    void setActive(boolean var1)
    int getPetnumber()
    void setPetnumber(int var1)
    long getLevel()
    void setLevel(long var1)
    long getPrestige()
    void setPrestige(long var1)
    double getGradeLevel()
    void setGradeLevel(double var1)
    double getGradeBuff()
    void setGradeBuff(double var1)
    double getGradeExperience()
    void setGradeExperience(double var1)
    double getExperience()
    void setExperience(double var1)
    long getNextUsageTime()
    void setNextUsageTime(long var1)
    long getNameUpdate()
    void setNameUpdate(long var1)
    UUID getUniqueNameUUID()
    void setUniqueNameUUID(UUID var1)
    UUID getUniqueBaseUUID()
    void setUniqueBaseUUID(UUID var1)
    String getEnhancement()
    void setEnhancement(String var1)
    boolean isRunning()
    void setRunning(boolean var1)
    
    
    PetBuffRegister abstract class: me.rivaldev.rivalpets.buffs
    Implements: Listener
    Instance Methods
    
    String pluginName()
    void setPluginName(String var1)
    void init()
    String getBuffName()
    Buff getBuff(ActivatedPet var1)
    void addExperience(ActivatedPet var1)
    void addExperienceMulti(ActivatedPet var1, long var2)
    void addExperienceNoEvent(ActivatedPet var1)
    double getMulti(ActivatedPet var1)
    boolean hasBuff(ActivatedPet var1)
    String getBuffMatching(ActivatedPet var1, String var2)
    boolean hasBuffMatching(ActivatedPet var1, String var2)
    boolean hasBuffWithName(ActivatedPet var1, String var2)
    void register()
    
    Abstract Methods
    
    abstract void onActivatePet(Player var1)
    abstract void onDeactivatePet(Player var1)
    
    Static Methods
    
    static void addExperience(ActivatedPet var0, String var1)
    static Buff getBuff(ActivatedPet var0, String var1)
    static double getMultiplier(ActivatedPet var0, String var1)
    static Buff getBuffByName(ActivatedPet var0, String var1)
    static boolean hasBuffWithNamePlaceholder(ActivatedPet var0, String var1)
    
    
    PetUpgradeRegister abstract class: me.rivaldev.rivalpets.buffs
    Implements: Listener
    Instance Methods
    
    String pluginName()
    void setPluginName(String var1)
    String upgradeName()
    void setupgradeName(String var1)
    void onUpgradeProc()
    long getLevel(Player var1)
    void register()
    void init()
    
    
    Buff class: me.rivaldev.rivalpets.buffs
    Constructor
    
    public Buff(String var1, double var2, double var4, double var6, double var8)
    
    Instance Methods
    
    String getName()
    void setName(String var1)
    double getDefaultMultiplier()
    void setDefaultMultiplier(double var1)
    double getPercentageIncrease()
    void setPercentageIncrease(double var1)
    double getExpPerLevel()
    void setExpPerLevel(double var1)
    double getExpPercentageIncrease()
    void setExpPercentageIncrease(double var1)
    
    
    StoragePet class: me.rivaldev.rivalpets.handlers
    Constructor
    
    public StoragePet(UUID var1)
    
    Instance Methods
    
    void addNormalPets(StoredPet var1)
    void addActivePets(ActiveStoredPet var1)
    UUID getOwner()
    List<StoredPet> getNormalPets()
    void setNormalPets(List<StoredPet> var1)
    List<ActiveStoredPet> getActivePets()
    void setActivePets(List<ActiveStoredPet> var1)
    
    
    StoredPet class: me.rivaldev.rivalpets.objects
    Implements: Serializable
    Constructor
    
    public StoredPet(UUID var1, UUID var2, String var3, long var4, double var6, long var8, long var10, String var12, long var13, double var15, double var17, double var19)
    
    Static Fields
    
    static final long serialVersionUID
    
    Instance Methods
    
    boolean equals(Object var1)
    int hashCode()
    UUID getOwner()
    void setOwner(UUID var1)
    UUID getPetUUID()
    void setPetUUID(UUID var1)
    String getType()
    void setType(String var1)
    long getPetLevel()
    void setPetLevel(long var1)
    long getPetPrestige()
    void setPetPrestige(long var1)
    double getGradeBuff()
    void setGradeBuff(double var1)
    double getGradeExperience()
    void setGradeExperience(double var1)
    double getGradeLevel()
    void setGradeLevel(double var1)
    double getPetxp()
    void setPetxp(double var1)
    long getCooldown()
    void setCooldown(long var1)
    long getLastUsage()
    void setLastUsage(long var1)
    String getEnhancement()
    void setEnhancement(String var1)
    
    
    RivalPetsCandyApplyEvent class: me.rivaldev.rivalpets.api.events
    Extends: Event
    Constructor
    
    public RivalPetsCandyApplyEvent(Player var1, String var2, double var3, int var5)
    
    Static Fields
    
    static final HandlerList HANDLERS
    
    Instance Methods
    
    String getCandy()
    void setXp(double var1)
    void setAmount(int var1)
    int getAmount()
    double getXp()
    Player getPlayer()
    HandlerList getHandlers()
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    RivalPetsCandyReceiveEvent class: me.rivaldev.rivalpets.api.events
    Extends: Event
    Constructor
    
    public RivalPetsCandyReceiveEvent(Player var1, String var2, long var3)
    
    Static Fields
    
    static final HandlerList HANDLERS
    
    Instance Methods
    
    String getCandy()
    long getAmount()
    void setAmount(long var1)
    Player getPlayer()
    HandlerList getHandlers()
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    RivalPetsLevelUpEvent class: me.rivaldev.rivalpets.api.events
    Extends: Event
    Constructor
    
    public RivalPetsLevelUpEvent(Player var1, long var2)
    
    Static Fields
    
    static final HandlerList HANDLERS
    
    Instance Methods
    
    long getLevel()
    Player getPlayer()
    HandlerList getHandlers()
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    RivalPetsPetActivatedEvent class: me.rivaldev.rivalpets.api.events
    Extends: Event
    Constructor
    
    public RivalPetsPetActivatedEvent(Player var1, String var2)
    
    Static Fields
    
    static final HandlerList HANDLERS
    
    Instance Methods
    
    String getPet()
    Player getPlayer()
    HandlerList getHandlers()
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    RivalPetsPetBoxOpenEvent class: me.rivaldev.rivalpets.api.events
    Extends: Event
    Constructor
    
    public RivalPetsPetBoxOpenEvent(Player var1, String var2, long var3)
    
    Static Fields
    
    static final HandlerList HANDLERS
    
    Instance Methods
    
    Player getPlayer()
    String getType()
    long getAmount()
    HandlerList getHandlers()
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    RivalPetsPetDeactivatedEvent class: me.rivaldev.rivalpets.api.events
    Extends: Event
    Constructor
    
    public RivalPetsPetDeactivatedEvent(Player var1, String var2)
    
    Static Fields
    
    static final HandlerList HANDLERS
    
    Instance Methods
    
    String getPet()
    Player getPlayer()
    HandlerList getHandlers()
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    RivalPetsUpgradeEvent class: me.rivaldev.rivalpets.api.events
    Extends: Event
    Constructor
    
    public RivalPetsUpgradeEvent(Player var1, String var2, double var3, long var5, boolean var7)
    
    Static Fields
    
    static final HandlerList HANDLERS
    
    Instance Methods
    
    void setSendMessage(boolean var1)
    boolean isSendMessage()
    long getLevels()
    double getCost()
    void setCost(double var1)
    String getUpgrade()
    Player getPlayer()
    HandlerList getHandlers()
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    
    RivalPetsXPGainEvent class: me.rivaldev.rivalpets.api.events
    Extends: Event
    Implements: Cancellable
    Constructor
    
    public RivalPetsXPGainEvent(Player var1, double var2)
    
    Static Fields
    
    static final HandlerList HANDLERS
    
    Instance Methods
    
    double getBoost()
    void setBoost(double var1)
    Player getPlayer()
    HandlerList getHandlers()
    boolean isCancelled()
    void setCancelled(boolean var1)
    
    Static Methods
    
    static HandlerList getHandlerList()
    
    Create Your Own Boosts & Buffs
    Down below you will see how you can create your very own boosts using the API!
    
    You can create boosts by registering the boost or not
    
    With Registering -> 
    
    Create a new Class that extends PetBuffRegister .
    
    public class ExampleBuff extends PetBuffRegister {
    Add these methods to it
    
        @Override
        public String getBuffName() {
            return "yourbuffname";
        }
    
    
        @Override
        public void onActivatePet(Player player) {
    
        }
    
        @Override
        public void onDeactivatePet(Player player) {
    
        }
    
        @EventHandler
        public void onBoost(YourCurrencyOrOtherEvents event) {
                    Player player = event.getPlayer();
                    if (RivalPetsAPI.getApi().hasBuff(player,getBuffName())){
                        RivalPetsAPI.getApi().addExperience(player,getBuffName());
                        double totalBoost = RivalPetsAPI.getApi().getBuffBoost(player,getBuffName())));
            }
        }
        
    After your done in your onEnable() you will need to register the buff like this, don't worry about registering Listeners that is handled by RivalPets and this way your buff will show up in /pets buffs.
    
    if (Bukkit.getPluginManager().getPlugin("RivalPets") != null) {
    RivalPetsAPI.getApi().registerBuff(new ExampleBuff(),"YourPluginName");
    }
    Make sure in your plugin.yml to add RivalPets to either soft-depend or depend
    
    Without Registering -> 
    
    In any listeners or anywhere in your code you can do:
    
    Note: this way you will have to register your events
    
    @EventHandler
        public void onBoost(YourCurrencyOrOtherEvents event) {
                    Player player = event.getPlayer();
                    String buffName = "yourdesiredbuff";
                    if (RivalPetsAPI.getApi().hasBuff(player,buffName )){
                    RivalPetsAPI.getApi().addExperience(player,buffName );    
                    double totalBoost = RivalPetsAPI.getApi().getBuffBoost(player,buffName)));
            }
        }
    `
};