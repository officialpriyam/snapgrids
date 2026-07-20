module.exports = {
    name: 'CombatLogX',
    description: 'CombatLogX is a plugin made for the Spigot server software. It has many combat-related features to add to your server. One of the main features of this plugin are the Expansions, which are like modules that allow you to add different things and change how the plugin works.',
    pluginId: 'CombatLogX',
    mavenIntegration: `
        <repositories>
            <!-- SirBlobman Public Repository -->
            <repository>
                <id>sirblobman-public</id>
                <url>https://nexus.sirblobman.xyz/public/</url>
            </repository>
        </repositories>
        <dependencies>
            <!-- BlueSlimeCore -->
            <dependency>
                <groupId>com.github.sirblobman.api</groupId>
                <artifactId>core</artifactId>
                <version>2.9-SNAPSHOT</version>
                <scope>provided</scope>
            </dependency>
            
            <!-- CombatLogX API -->
            <dependency>
                <groupId>com.github.sirblobman.combatlogx</groupId>
                <artifactId>api</artifactId>
                <version>11.4-SNAPSHOT</version>
                <scope>provided</scope>
            </dependency>
        </dependencies>
    `,
    usage: `
    MAIN Package: com.github.sirblobman.combatlogx.api
    
    Example 01: Check if CombatLogX is enabled and get an instance of it.

    public boolean isEnabled() {
        PluginManager pluginManager = Bukkit.getPluginManager();
        return pluginManager.isPluginEnabled("CombatLogX");
    }
    
    public ICombatLogX getAPI() {
        PluginManager pluginManager = Bukkit.getPluginManager();
        Plugin plugin = pluginManager.getPlugin("CombatLogX");
        return (ICombatLogX) plugin;
    }
    
    ICombatLogX interface: com.github.sirblobman.combatlogx.api
    Interface Methods
    
    @NotNull ConfigurablePlugin getPlugin()
    void onReload()
    @NotNull PlayerDataManager getPlayerDataManager()
    @NotNull LanguageManager getLanguageManager()
    @NotNull ExpansionManager getExpansionManager()
    @NotNull ICombatManager getCombatManager()
    @NotNull ITimerManager getTimerManager()
    @NotNull IPunishManager getPunishManager()
    @NotNull IDeathManager getDeathManager()
    @NotNull IPlaceholderManager getPlaceholderManager()
    @NotNull IForgiveManager getForgiveManager()
    boolean isDebugModeDisabled()
    void printDebug(String @NotNull ... messageArray)
    void printDebug(@NotNull Throwable ex)
    @NotNull MainConfiguration getConfiguration()
    @NotNull CommandConfiguration getCommandConfiguration()
    @NotNull PunishConfiguration getPunishConfiguration()
    @NotNull ICrystalManager getCrystalManager()
    
    ICombatManager interface: com.github.sirblobman.combatlogx.api.manager
    Interface Methods
    
    boolean tag(@NotNull Player player, @Nullable Entity enemy, @NotNull TagType tagType, @NotNull TagReason tagReason)
    boolean tag(@NotNull Player player, @Nullable Entity enemy, @NotNull TagType tagType, @NotNull TagReason tagReason, long customEndMillis)
    void untag(@NotNull Player player, @NotNull UntagReason untagReason)
    void untag(@NotNull Player player, @NotNull Entity enemy, @NotNull UntagReason untagReason)
    boolean isInCombat(@NotNull Player player)
    @NotNull Set<UUID> getPlayerIdsInCombat()
    @NotNull List<Player> getPlayersInCombat()
    @Nullable TagInformation getTagInformation(@NotNull Player player)
    int getMaxTimerSeconds(@NotNull Player player)
    @Nullable Permission getBypassPermission()
    boolean canBypass(@NotNull Player player)
    
    ICrystalManager interface: com.github.sirblobman.combatlogx.api.manager
    Interface Methods
    
    @Nullable Player getPlacer(@NotNull Entity crystal)
    void setPlacer(@NotNull Entity crystal, @NotNull Player player)
    void remove(@NotNull UUID crystalId)
    
    IDeathManager interface: com.github.sirblobman.combatlogx.api.manager
    Interface Methods
    
    void kill(@NotNull Player player, @NotNull List<Entity> enemyList)
    boolean wasPunishKilled(@NotNull Player player)
    boolean stopTracking(@NotNull Player player)
    @NotNull List<Entity> getTrackedEnemies(@NotNull Player player)
    
    IForgiveManager interface: com.github.sirblobman.combatlogx.api.manager
    Interface Methods
    
    boolean getToggleValue(@NotNull OfflinePlayer player)
    void setToggle(@NotNull OfflinePlayer player, boolean value)
    @Nullable CombatTag getActiveRequest(@NotNull OfflinePlayer player)
    void setRequest(@NotNull OfflinePlayer player, @NotNull CombatTag request)
    void removeRequest(@NotNull OfflinePlayer player)
    
    IPunishManager interface: com.github.sirblobman.combatlogx.api.manager
    Interface Methods
    
    boolean punish(@NotNull Player player, @NotNull UntagReason punishReason, @NotNull List<Entity> previousEnemies)
    long getPunishmentCount(@NotNull OfflinePlayer player)
    void resetPunishmentCount(@NotNull OfflinePlayer player)
    
    ITimerManager interface: com.github.sirblobman.combatlogx.api.manager
    Interface Methods
    
    @NotNull Set<TimerUpdater> getTimerUpdaters()
    void addUpdaterTask(@NotNull TimerUpdater task)
    void remove(@NotNull Player player)
    void register()
    
    TagInformation class: com.github.sirblobman.combatlogx.api.object
    Constructors
    
    TagInformation(@NotNull OfflinePlayer player)
    TagInformation(@NotNull UUID playerId)
    
    CombatTag class: com.github.sirblobman.combatlogx.api.object
    Constructors
    
    CombatTag(@Nullable Entity enemy, @NotNull TagType tagType, @NotNull TagReason tagReason, long expireMillis)
    
    Public Methods
    
    @Nullable UUID getEnemyId()
    @Nullable Entity getEnemy()
    boolean doesEnemyMatch(@NotNull Entity entity)
    @NotNull TagType getTagType()
    @NotNull TagReason getTagReason()
    long getExpireMillis()
    boolean isExpired()
    int compareTo(@NotNull CombatTag other) (overrides)
    
    SpecialPunishCommand class: com.github.sirblobman.combatlogx.api.object
    Constructors
    
    SpecialPunishCommand(@NotNull String id)
    
    Public Methods
    
    @NotNull String getId()
    void load(ConfigurationSection section) (overrides)
    int getAmountMin()
    void setAmountMin(int amountMin)
    int getAmountMax()
    void setAmountMax(int amountMax)
    boolean isReset()
    void setReset(boolean reset)
    @NotNull List<String> getCommands()
    void setCommands(@NotNull Collection<String> commands)
    
    TimerUpdater interface: com.github.sirblobman.combatlogx.api.object
    Interface Methods
    
    void update(@NotNull Player player, long timeLeftMillis)
    void remove(@NotNull Player player)
    
    Enumerations
    CitizensSlotType enum: com.github.sirblobman.combatlogx.api.object
    
    ARMOR
    INVENTORY
    OFFHAND
    
    KillTime enum: com.github.sirblobman.combatlogx.api.object
    
    QUIT
    JOIN
    NEVER
    
    NoEntryMode enum: com.github.sirblobman.combatlogx.api.object
    
    DISABLED
    VULNERABLE
    CANCEL_EVENT
    KILL_PLAYER
    TELEPORT_TO_ENEMY
    KNOCKBACK_PLAYER
    
    TagReason enum: com.github.sirblobman.combatlogx.api.object
    
    UNKNOWN
    ATTACKED
    ATTACKER
    
    TagType enum: com.github.sirblobman.combatlogx.api.object
    
    UNKNOWN
    PLAYER
    MOB
    DAMAGE
    MYTHIC_MOB
    
    TimerType enum: com.github.sirblobman.combatlogx.api.object
    
    GLOBAL
    PERMISSION
    
    UntagReason enum: com.github.sirblobman.combatlogx.api.object
    Enum Methods
    
    boolean isExpire()
    
    Enum Values
    
    EXPIRE(true)
    SELF_DEATH(true)
    ENEMY_DEATH(true)
    ENEMY_FORGIVE(true)
    QUIT
    KICK
    
    EVENTS YOU CAN LISTEN TO:
    NPCDropItemEvent class: com.github.sirblobman.combatlogx.api.event
    Constructors
    
    NPCDropItemEvent(@NotNull ItemStack item, @NotNull OfflinePlayer player, @NotNull Location location, @NotNull CitizensSlotType slotType)
    
    Static Methods
    
    static @NotNull HandlerList getHandlerList()
    
    Public Methods
    
    HandlerList getHandlers() (overrides)
    @NotNull OfflinePlayer getPlayer()
    @NotNull Location getLocation()
    @NotNull ItemStack getItem()
    void setItem(@NotNull ItemStack item)
    @NotNull CitizensSlotType getSlotType()
    boolean isCancelled() (overrides)
    void setCancelled(boolean cancelled) (overrides)
    
    PlayerEnemyRemoveEvent class: com.github.sirblobman.combatlogx.api.event
    Constructors
    
    PlayerEnemyRemoveEvent(@NotNull Player player, @NotNull UntagReason untagReason, @NotNull Entity enemy)
    
    Static Methods
    
    static @NotNull HandlerList getHandlerList()
    
    Public Methods
    
    @NotNull HandlerList getHandlers() (overrides)
    @NotNull UntagReason getUntagReason()
    @NotNull Entity getEnemy()
    
    PlayerPreTagEvent class: com.github.sirblobman.combatlogx.api.event
    Constructors
    
    PlayerPreTagEvent(@NotNull Player player, @Nullable Entity enemy, @NotNull TagType tagType, @NotNull TagReason tagReason)
    
    Static Methods
    
    static @NotNull HandlerList getHandlerList()
    
    Public Methods
    
    HandlerList getHandlers() (overrides)
    @Nullable Entity getEnemy()
    @NotNull TagType getTagType()
    @NotNull TagReason getTagReason()
    
    PlayerPunishEvent class: com.github.sirblobman.combatlogx.api.event
    Constructors
    
    PlayerPunishEvent(@NotNull Player player, @NotNull UntagReason punishReason, @NotNull List<Entity> enemyList)
    
    Static Methods
    
    static @NotNull HandlerList getHandlerList()
    
    Public Methods
    
    HandlerList getHandlers() (overrides)
    @NotNull UntagReason getPunishReason()
    @NotNull List<Entity> getEnemies()
    
    PlayerReTagEvent class: com.github.sirblobman.combatlogx.api.event
    Constructors
    
    PlayerReTagEvent(@NotNull Player player, @Nullable Entity enemy, @NotNull TagType tagType, @NotNull TagReason tagReason, long combatEndMillis)
    
    Static Methods
    
    static @NotNull HandlerList getHandlerList()
    
    Public Methods
    
    @NotNull HandlerList getHandlers() (overrides)
    @Nullable Entity getEnemy()
    @NotNull TagType getTagType()
    @NotNull TagReason getTagReason()
    long getEndTime()
    void setEndTime(long millis)
    
    PlayerTagEvent class: com.github.sirblobman.combatlogx.api.event
    Constructors
    
    PlayerTagEvent(@NotNull Player player, @Nullable Entity enemy, @NotNull TagType tagType, @NotNull TagReason tagReason, long combatEndMillis)
    
    Static Methods
    
    static @NotNull HandlerList getHandlerList()
    
    Public Methods
    
    @NotNull HandlerList getHandlers() (overrides)
    @Nullable Entity getEnemy()
    @NotNull TagType getTagType()
    @NotNull TagReason getTagReason()
    long getEndTime()
    void setEndTime(long millis)
    
    PlayerUntagEvent class: com.github.sirblobman.combatlogx.api.event
    Constructors
    
    PlayerUntagEvent(@NotNull Player player, @NotNull UntagReason untagReason, @NotNull List<Entity> previousEnemyList)
    
    Static Methods
    
    static @NotNull HandlerList getHandlerList()
    
    Public Methods
    
    @NotNull HandlerList getHandlers() (overrides)
    @NotNull UntagReason getUntagReason()
    @NotNull List<Entity> getPreviousEnemies()
    `
};