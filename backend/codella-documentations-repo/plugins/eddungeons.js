module.exports = {
    name: 'EdDungeons',
    description: 'API to access EdDungeons features including zones, currencies, enchantments, GUI systems, booster management, leveling systems, and advanced entity management with fake entities, custom 3D models, and goal-based AI behavior',
    pluginId: 'EdDungeons',
    systemDownloadURL: `
        https://raw.githubusercontent.com/CodellaAI/codella-documentations/main/lib/EdDungeons-API.jar
        https://raw.githubusercontent.com/CodellaAI/codella-documentations/main/lib/EdLib-API.jar
    `,
    dependencies: `
        Java 21
    `,
    mavenIntegration: `
        <repositories>
            // SYSTEM DEPENDENCY NO REPOSITORY
        </repositories>
        <dependencies>
            <!-- EdDungeons main API -->
            <dependency>
                <groupId>es.edwardbelt.eddungeons</groupId>
                <artifactId>api</artifactId>
                <version>1.2</version>
                <scope>system</scope>
                <systemPath>\${basedir}/lib/EdDungeons-API.jar</systemPath>
            </dependency>
            
            <!-- EdLib low-level API -->
            <dependency>
                <groupId>es.edwardbelt.edlib</groupId>
                <artifactId>api</artifactId>
                <version>1.0</version>
                <scope>system</scope>
                <systemPath>\${basedir}/lib/EdLib-API.jar</systemPath>
            </dependency>
        </dependencies>
    `,
    usage: `
        /**
         * EdDungeons API Overview
         * The EdDungeons API consists of two main system dependencies:
         * 
         * EdLib-API.jar:
         * - Low-level server functionality and utilities
         * - Fake entity management and manipulation
         * - Packet handling and NMS abstraction
         * - Cross-version compatibility layers
         * - Performance-optimized server operations
         * - Everything inside EdLib API can be executed asynchronously
         * 
         * EdDungeons-API.jar:
         * - High-level EdDungeons plugin integration
         * - Zone management and manipulation
         * - Booster system integration
         * - GUI framework and management
         * - Mob configuration and behavior
         * - Currency and leveling system access
         */
         
         Inside the plugin.yml you should only add EdDungeons plugin as a depend, the EdLib API is inside the main EdDungeons jar.
        
        Core API Classes
        EdDungeonsAPI interface: es.edwardbelt.eddungeons.iapi
        Static Methods
        void setInstance(EdDungeonsAPI instance)
        EdDungeonsAPI getInstance()
        Instance Methods
        EdDungeonsEnchantAPI getEnchantAPI()
        EdDungeonsGuisAPI getGuisAPI()
        EdDungeonsSwordAPI getSwordAPI()
        EdDungeonsZonesAPI getZonesAPI()
        EdDungeonsCurrencyAPI getCurrencyAPI()
        EdDungeonsLevelingAPI getLevelingAPI()
        EdDungeonsBoostersAPI getBoostersAPI()
        EdLibAPI interface: es.edwardbelt.edlib.iapi
        Static Methods
        void setInstance(EdLibAPI instance)
        EdLibAPI getInstance()
        Instance Methods
        EdModel getModel(String modelId)
        EdEntity createEntity(EntityType type, Location location)
        EdEntity createInteractionEntity(Location location, float width, float height)
        EdEntity createBlockDisplay(Location location, Matrix4f transformation, Material material)
        EdEntity createItemDisplay(Location location, Matrix4f transformation, String itemData, int[] customModelData, String nbtData)
        void sendActionbar(Player player, String message)
        void sendXPBar(Player player, float progress, int level)
        void hidePlayer(Player viewer, Player target)
        void showPlayer(Player viewer, Player target)
        void sendBlocks(Player player, Map<Vector, Material> blocks)
        void sendBossBar(Player player, UUID bossBarId, String title, float progress, String color)
        void updateBossBarTitle(Player player, UUID bossBarId, String title)
        void updateBossBarProgress(Player player, UUID bossBarId, float progress)
        void removeBossBar(Player player, UUID bossBarId)
        Sub-API Interfaces
        EdDungeonsBoostersAPI interface: es.edwardbelt.eddungeons.iapi
        Instance Methods
        double getBoosterValueByEconomy(UUID playerId, String economy)
        double getBoosterValueGlobalEnchants(UUID playerId)
        List<String> getActiveBoosters(UUID playerId)
        void removeBooster(UUID playerId, String boosterId)
        boolean existsBooster(UUID playerId, String boosterId)
        String getBoosterCurrency(UUID playerId, String boosterId)
        boolean isBoosterEnchantType(UUID playerId, String boosterId)
        String getBoosterName(UUID playerId, String boosterId)
        double getBoosterMultiplier(UUID playerId, String boosterId)
        long getBoosterDuration(UUID playerId, String boosterId)
        long getBoosterRemainingTime(UUID playerId, String boosterId)
        void setBoosterMultiplier(UUID playerId, String boosterId, double multiplier)
        void setBoosterDuration(UUID playerId, String boosterId, long duration)
        void setBoosterEnchantBooster(UUID playerId, String boosterId, boolean isEnchantBooster)
        void setBoosterEconomy(UUID playerId, String boosterId, String economy)
        void setBoosterTimeLeft(UUID playerId, String boosterId, long timeLeft)
        void addBooster(UUID playerId, String boosterId, String name, String currency, double multiplier, long duration, boolean isEnchantBooster, boolean saveData)
        EdDungeonsCurrencyAPI interface: es.edwardbelt.eddungeons.iapi
        Instance Methods
        BigDecimal getCurrency(UUID playerId, String currencyId)
        void setCurrency(UUID playerId, String currencyId, BigDecimal amount)
        void addCurrency(UUID playerId, String currencyId, BigDecimal amount)
        void removeCurrency(UUID playerId, String currencyId, BigDecimal amount)
        void isCurrency(String currencyId)
        double getMaxCurrencyValue(String currencyId)
        double getStartingCurrencyValue(String currencyId)
        String getCurrencyName(String currencyId)
        EdDungeonsEnchantAPI interface: es.edwardbelt.eddungeons.iapi
        Instance Methods
        void registerEnchant(String enchantId, APIEnchant enchant)
        void addEnchantLevel(UUID playerId, String enchantId, double levels)
        double getEnchantLevel(UUID playerId, String enchantId)
        void removeEnchantLevel(UUID playerId, String enchantId, double levels)
        void triggerCustomEnchant(Player player, String enchantId, int mobId)
        boolean tryTriggerCustomEnchant(Player player, String enchantId, int mobId)
        double getEnchantChance(UUID playerId, String enchantId)
        double getEnchantMaxLevel(String enchantId)
        double getEnchantStartingLevel(String enchantId)
        double getEnchantMaxChance(String enchantId)
        EdDungeonsGuisAPI interface: es.edwardbelt.eddungeons.iapi
        Instance Methods
        void openGui(Player player, String guiId)
        void openGui(Player player, String guiId, Map<String, String> placeholders)
        void closeGui(Player player)
        void loadGui(String guiId, File guiFile)
        EdDungeonsLevelingAPI interface: es.edwardbelt.eddungeons.iapi
        Instance Methods
        void setLevel(UUID playerId, String levelType, double level)
        double getLevel(UUID playerId, String levelType)
        void addLevel(UUID playerId, String levelType, double levels)
        void removeLevel(UUID playerId, String levelType, double levels)
        boolean isLevel(String levelType)
        double getStartingLevel(String levelType)
        boolean isAutomaticLeveling(String levelType)
        String getLevelName(String levelType)
        List<String> getForEachRewards(String levelType)
        Map<Double, List<String>> getIntervalRewards(String levelType)
        Map<Double, List<String>> getSpecificRewards(String levelType)
        EdDungeonsSwordAPI interface: es.edwardbelt.eddungeons.iapi
        Instance Methods
        ItemStack getSwordItemFromPlayer(Player player)
        boolean isItemSword(ItemStack item)
        BigDecimal getPlayerSwordDamage(Player player)
        EdDungeonsZonesAPI interface: es.edwardbelt.eddungeons.iapi
        Instance Methods
        void joinSession(Player player, String zoneId)
        void leaveSession(Player player)
        boolean isPlayerInSession(Player player)
        String getPlayerZoneId(Player player)
        void setPlayerZoneStageId(Player player, String zoneId, String stageId)
        String getPlayerZoneStageId(Player player, String zoneId)
        Set<Integer> getPlayerMobsInZone(Player player)
        BigDecimal getPlayerZoneMobHealth(Player player, int mobId)
        String getPlayerZoneMobConfigId(Player player, int mobId)
        void startAutoHitMob(Player player, int mobId)
        void hitMob(Player player, int mobId, BigDecimal damage, boolean giveSwingCurrenciis, boolean triggerEnchants)
        EdEntity getMobEntity(Player player, int mobId)
        Event Classes
        EdDungeonsChangeZoneStageEvent class: es.edwardbelt.eddungeons.iapi.event
        Static Methods
        HandlerList getHandlerList()
        Instance Methods
        HandlerList getHandlers()
        Player getPlayer()
        String getZoneId()
        String getStageId()
        boolean isCancelled()
        EdDungeonsCurrencyAddEvent class: es.edwardbelt.eddungeons.iapi.event
        Static Methods
        HandlerList getHandlerList()
        Instance Methods
        void addMultiplier(double multiplier)
        HandlerList getHandlers()
        UUID getUuid()
        String getCurrency()
        BigDecimal getAmount()
        double getMultiplier()
        boolean isCancelled()
        void setCurrency(String currency)
        void setAmount(BigDecimal amount)
        void setMultiplier(double multiplier)
        EdDungeonsEnchantTryProcEvent class: es.edwardbelt.eddungeons.iapi.event
        Static Methods
        HandlerList getHandlerList()
        Instance Methods
        HandlerList getHandlers()
        Player getPlayer()
        String getEnchant()
        double getChance()
        boolean isCancelled()
        void setChance(double chance)
        EdDungeonsJoinZoneEvent class: es.edwardbelt.eddungeons.iapi.event
        Static Methods
        HandlerList getHandlerList()
        Instance Methods
        HandlerList getHandlers()
        Player getPlayer()
        String getZoneId()
        String getStageId()
        boolean isCancelled()
        EdDungeonsSwingSwordEvent class: es.edwardbelt.eddungeons.iapi.event
        Static Methods
        HandlerList getHandlerList()
        Instance Methods
        HandlerList getHandlers()
        Player getPlayer()
        int getEntityId()
        BigDecimal getDamageDealt()
        boolean isCancelled()
        EdDungeosMobDeathEvent class: es.edwardbelt.eddungeons.iapi.event
        Static Methods
        HandlerList getHandlerList()
        Instance Methods
        HandlerList getHandlers()
        Player getPlayer()
        String getMobConfigId()
        Enchant System
        APIEnchant interface: es.edwardbelt.eddungeons.iapi.enchant
        Instance Methods
        void onProc(Player player, EnchantData data)
        EnchantData abstract class: es.edwardbelt.eddungeons.iapi.enchant
        CustomEnchantData class: es.edwardbelt.eddungeons.iapi.enchant
        Instance Methods
        int getMobId()
        Crystal System
        CrystalData class: es.edwardbelt.eddungeons.iapi.crystals
        Static Methods
        CrystalData fromNBT(ReadableNBT nbt)
        Instance Methods
        UUID getUUID()
        String getBoost()
        int getMultiplier()
        Model System
        EdModel interface: es.edwardbelt.edlib.iapi.model
        Instance Methods
        String getId()
        Float getMaxHeight()
        EdModelEntity createEntity(Location location)
        EdModelEntity interface: es.edwardbelt.edlib.iapi.model
        Instance Methods
        EdEntity getInteractionEntity()
        EdEntity getMainEntity()
        EdEntity getDisplayName()
        Map<String, EdEntity> getPassengers()
        EdModel getModel()
        void setYaw(float yaw)
        void setPitch(float pitch)
        void rotate(float yaw, float pitch)
        void spawn()
        void setGlowing(EdColor color)
        void addWatcher(Player player)
        void remove()
        void playAnimation(String animationId)
        void playLoopAnimation(String animationId)
        void stopAnimation()
        boolean isPlayingAnimation()
        String getCurrentAnimation()
        Entity System
        EdEntity interface: es.edwardbelt.edlib.iapi.entity
        Instance Methods
        Integer getId()
        UUID getUUID()
        EntityType getType()
        Object getEntity()
        void addWatcher(Player player)
        void removeWatcher(Player player)
        Collection<Player> getWatchers()
        void damageEffect()
        void spawn()
        void spawnForPlayer(Player player)
        void remove()
        void removeForPlayer(Player player)
        void setGravity(boolean hasGravity)
        void setInFire(boolean inFire)
        void setEquipment(EntityEquipmentSlot slot, ItemStack item)
        void playAnimation(EntityAnimation animation)
        void setSlimeSize(int size)
        void setSmall()
        void setInvisible()
        void setDisplayName(String name)
        void setGlowing(EdColor color)
        float getNameHeight()
        Vector getPosition()
        void tp(double x, double y, double z)
        void shortTp(double x, double y, double z)
        void rotateBodyAndMove(double x, double y, double z, float yaw, float pitch)
        void setNMSLocation(double x, double y, double z, float yaw, float pitch)
        void setTransformation(Matrix4f transformation)
        void setTransformationWithInterpolation(Matrix4f transformation, int duration)
        void setTransformationWithInterpolation(Matrix4f transformation, int duration, int delay)
        void setInterpolationDuration(int duration)
        void startInterpolation()
        void setYawHead(float yaw)
        void setYaw(float yaw)
        void setPitch(float pitch)
        void rotateBody(float yaw, float pitch)
        void rotateHead(float yaw)
        Vector getLocVector()
        void setPassengers(List<EdEntity> passengers)
        void addPassenger(EdEntity passenger)
        void addGoal(EdGoal goal)
        void startNextGoal()
        void onGoalComplete()
        Queue<EdGoal> getGoalQueue()
        EdGoal getCurrentGoal()
        void setCurrentGoal(EdGoal goal)
        void clearGoals()
        void skipCurrentGoal()
        EdLivingEntity interface: es.edwardbelt.edlib.iapi.entity
        EdFallingBlock interface: es.edwardbelt.edlib.iapi.entity
        Instance Methods
        Material getBlockMaterial()
        void setFallingBlock(Material material)
        EdPrimedTNT interface: es.edwardbelt.edlib.iapi.entity
        Instance Methods
        long getFuseTicks()
        void setFuseTicks(long ticks)
        Material getMaterial()
        void setMaterial(Material material)
        EntityHolder class: es.edwardbelt.edlib.iapi.entity
        Constructors:
        1. Entity entity (bukkit entity)
        2. EdEntity edEntity
        Instance Methods
        Vector getPosition()
        Goal System
        EdGoal abstract class: es.edwardbelt.edlib.iapi.entity.goal // you can create your own goals for custom mob movements
        Static Methods
        Instance Methods
        void start()
        void init()
        void forceStop()
        boolean isRunning()
        boolean shouldExecute()
        void tick()
        void setEndRunnable(Runnable endRunnable)
        void setStartRunnable(Runnable startRunnable)
        void setEachTickRunnable(Runnable eachTickRunnable)
        EdEntity getEntity()
        void setEntity(EdEntity entity)
        boolean isForceStopped()
        EdGoalOrbit class: es.edwardbelt.edlib.iapi.entity.goal.impl
        Constructor: Vector center, double radius, double angularSpeed, boolean clockwise, int ticksDuration
        Instance Methods
        void start()
        boolean shouldExecute()
        void tick()
        Vector getCenterPoint()
        double getRadius()
        boolean isClockwise()
        double getCurrentAngle()
        void setAffectY(boolean affectY)
        void setSendRotationEachTick(boolean sendRotationEachTick)
        void setInvertRotation(boolean invertRotation)
        void setSendRotation(boolean sendRotation)
        EdGoalArchMove class: es.edwardbelt.edlib.iapi.entity.goal.impl
        Constructor: Vector end, double speed, long duration
        Instance Methods
        void start()
        boolean shouldExecute()
        void tick()
        EdGoalDelay class: es.edwardbelt.edlib.iapi.entity.goal.impl
        Instance Methods
        boolean shouldExecute()
        void start()
        void tick()
        double getProgress()
        int getRemainingTicks()
        double getRemainingSeconds()
        EdGoalFollowEntity class: es.edwardbelt.edlib.iapi.entity.goal.impl
        Constructor: EntityHolder target, double followDistance, double speed, long duration // for infinite duration just set a high value such as 100000
        Instance Methods
        void start()
        boolean shouldExecute()
        void tick()
        EdGoalMove class: es.edwardbelt.edlib.iapi.entity.goal.impl
        Constructor: Vector moveGoal, double speed
        Instance Methods
        boolean shouldExecute()
        void start()
        void tick()
        void setAffectY(boolean affectY)
        void setSendRotationEachTick(boolean sendRotationEachTick)
        void setInvertRotation(boolean invertRotation)
        void setSendRotation(boolean sendRotation)
        EdGoalParabolicMove class: es.edwardbelt.edlib.iapi.entity.goal.impl
        Constructor: Vector end, double height, long duration
        Instance Methods
        void start()
        boolean shouldExecute()
        void tick()
        Enums
        EdColor enum: es.edwardbelt.edlib.iapi
        Instance Methods
        String getName()
        Values
        BLACK("black"),
        DARK_BLUE("dark_blue"),
        DARK_GREEN("dark_green"),
        DARK_AQUA("dark_aqua"),
        DARK_RED("dark_red"),
        DARK_PURPLE("dark_purple"),
        GOLD("gold"),
        GRAY("gray"),
        DARK_GRAY("dark_gray"),
        BLUE("blue"),
        GREEN("green"),
        AQUA("aqua"),
        RED("red"),
        LIGHT_PURPLE("light_purple"),
        YELLOW("yellow"),
        WHITE("white"),
        ORANGE("orange"),
        MAGENTA("magenta"),
        LIGHT_BLUE("light_blue"),
        LIME("lime"),
        PINK("pink"),
        LIGHT_GRAY("light_gray"),
        CYAN("cyan"),
        PURPLE("purple"),
        BROWN("brown");
        
        EntityAnimation enum: es.edwardbelt.edlib.iapi.entity
        Instance Methods
        int getId()
        Values
        SWING_MAIN_HAND(0),
        SWING_OFF_HAND(3),
        LEAVE_BED(1),
        CRITICAL_EFFECT(4),
        MAGIC_CRITICAL_EFFECT(5);
        
        EntityEquipmentSlot enum: es.edwardbelt.edlib.iapi.entity
        Instance Methods
        int getId()
        Values
        MAIN_HAND(0),
        OFF_HAND(1),
        BOOTS(2),
        LEGGINGS(3),
        CHESTPLATE(4),
        HELMET(5),
        BODY(6),
        SADDLE(7);
        
        When creating enchants/spawning EdLib packet-based entities, make sure you:
        - Run the hitMob and startAutoHit methods asynchronously inside the Zones API
        - Spawn the entities asynchronously
        - Always spawn entities packet-based for the player who procced the enchant. If you spawn particles, spawn them only for the player who procced the enchant. Remember that the enchant effects must only be seen by the player.
        - If you want to move a packet-based entity, always create custom goal implementations or use existing ones. If you create custom ones, move the mob with the EdEntity#shortTp(double x, double y, double z) method.
        - If you create an enchantment and need to deal damage to a mob, deal damage to the mobId inside the CustomEnchantData if it hasn't been specified to damage other mobs.
        - Always add cool particle effects to the enchantments. The more, the better. Spawn these only to the player and asynchronously.
        - After you've created an enchant, tell the user that to set it up they should add a new file inside the plugins/EdDungeons/enchants folder:
            file name: <enchant_id>.yml
            file contents:
            \`\`\`
            max-chance: 0 # The max chance of the enchant. Example: 5
            max-level: 0 # The max level of the enchant. Example: 1000
            material: '' # A Bukkit Material representing the enchantment. Example: SLIME_BALL
            type: 'api' # Always api type
            display-name: '' # Example: Slime Bunny
            cost:
              currency: souls # Always souls
              starting-cost: 100
              increase-cost-by: 500
            \`\`\`
    `
};

