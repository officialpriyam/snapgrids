module.exports = {
    name: 'EdTools',
    description: 'API to access EdTools features including zone sessions, currencies, enchantments, omnitools, luckyblocks, GUI systems, booster management, leveling systems, and advanced entity management with fake entities and goal-based AI behavior',
    pluginId: 'EdTools',
    systemDownloadURL: `
        https://raw.githubusercontent.com/CodellaAI/codella-documentations/main/lib/EdTools-API.jar
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
            <!-- EdTools main API -->
            <dependency>
                <groupId>es.edwardbelt.edtools</groupId>
                <artifactId>api</artifactId>
                <version>1.0</version>
                <scope>system</scope>
                <systemPath>\${basedir}/lib/EdTools-API.jar</systemPath>
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
         * EdTools API Overview
         * The EdTools API consists of two main system dependencies:
         * 
         * EdLib-API.jar:
         * - Low-level server functionality and utilities
         * - Fake entity management and manipulation
         * - Packet handling and NMS abstraction
         * - Cross-version compatibility layers
         * - Performance-optimized server operations
         * - Everything inside EdLib API can be executed asynchronously
         * 
         * EdTools-API.jar:
         * - High-level EdTools plugin integration
         * - Zone session management and manipulation
         * - Booster system integration
         * - GUI framework and management
         * - Lucky blocks and omnitool management
         * - Currency and leveling system access
         */
         
         Inside the plugin.yml you should only add EdTools plugin as a depend, the EdLib API is inside the main EdTools jar.
        
        EdToolsAPI interface: es.edwardbelt.edgens.iapi
        Description: Main API entry point - provides access to all EdTools sub-APIs
        Static Methods:
        
        static void setInstance(EdToolsAPI instance) - Sets the singleton instance
        static EdToolsAPI getInstance() - Returns the singleton instance
        
        Instance Methods:
        
        EdToolsEnchantAPI getEnchantAPI() - Returns the enchantment API
        EdToolsLuckyBlocksAPI getLuckyBlocksAPI() - Returns the lucky blocks API
        EdToolsGuisAPI getGuisAPI() - Returns the GUI API
        EdToolsZonesAPI getZonesAPI() - Returns the zones API
        EdToolsOmniToolAPI getOmniToolAPI() - Returns the omnitool API
        EdToolsCurrencyAPI getCurrencyAPI() - Returns the currency API
        EdToolsBoostersAPI getBoostersAPI() - Returns the boosters API
        EdToolsBackpackAPI getBackpackAPI() - Returns the backpack API
        EdToolsSellAPI getSellAPI() - Returns the sell API
        
        Inner Classes:
        InstanceHolder - Holds the singleton instance
        public static EdToolsAPI INSTANCE - The singleton instance field
        
        EdToolsEnchantAPI interface: es.edwardbelt.edgens.iapi
        Description: API for managing custom enchantments and enchant levels
        Instance Methods:
        
        void registerEnchant(String id, APIEnchant enchant) - Registers a custom enchant
        void addEnchantLevel(UUID uuid, String enchant, double level) - Adds levels to a player's enchant
        double getEnchantLevel(UUID uuid, String enchant) - Gets a player's enchant level
        void removeEnchantLevel(UUID uuid, String enchant, double level) - Removes levels from a player's enchant
        void triggerCustomEnchant(Player player, String enchant, Material material, Vector position) - Triggers a custom enchant effect
        boolean tryTriggerCustomEnchant(Player player, String enchant, Material material, Vector position) - Attempts to trigger a custom enchant (returns success)
        double getEnchantChance(UUID uuid, String enchant) - Gets the proc chance for an enchant
        double getEnchantMaxLevel(String enchant) - Gets the maximum level for an enchant
        double getEnchantStartingLevel(String enchant) - Gets the starting level for an enchant
        double getEnchantMaxChance(String enchant) - Gets the maximum chance for an enchant
        
        
        EdToolsCurrencyAPI interface: es.edwardbelt.edgens.iapi
        Description: API for managing custom currencies
        Instance Methods:
        
        double getCurrency(UUID uuid, String currency) - Gets a player's currency amount
        void setCurrency(UUID uuid, String currency, double amount) - Sets a player's currency amount
        void addCurrency(UUID uuid, String currency, double amount) - Adds currency to a player
        void addCurrency(UUID uuid, String currency, double amount, boolean affectBoosters) - Adds currency with booster option
        void removeCurrency(UUID uuid, String currency, double amount) - Removes currency from a player
        void isCurrency(String currency) - Checks if a currency exists
        double getMaxCurrencyValue(String currency) - Gets the maximum value for a currency
        double getStartingCurrencyValue(String currency) - Gets the starting value for a currency
        String getCurrencyName(String currency) - Gets the display name of a currency
        
        
        EdToolsZonesAPI interface: es.edwardbelt.edgens.iapi
        Description: API for managing mining zones and sessions
        Instance Methods:
        
        void joinGlobalSession(Player player, String zoneId) - Adds player to a global zone session
        void joinAloneSession(Player player, String zoneId) - Creates a private zone session for player
        void leaveSession(Player player) - Removes player from their current session
        boolean isPlayerInSession(Player player) - Checks if player is in a session
        String getPlayerZoneId(Player player) - Gets the zone ID the player is in
        String getPlayerZoneSessionType(Player player) - Gets the session type (global/alone)
        void setPlayerBlocksTypeZone(Player player, String zoneId, String blocksType) - Sets the block type for a zone
        String getPlayerBlocksTypeZone(Player player, String zoneId) - Gets the block type for a zone
        Map<Vector, Material> getPlayersLoadedBlocks(Player player) - Gets all loaded blocks for a player
        APIPair<Material, String> mineBlockAsPlayer(Player player, Vector position, String toolId, boolean affectEnchants, boolean affectSell, boolean affectBlockCurrencies, boolean affectLuckyBlocks) - Simulates player mining a block with options
        
        
        EdToolsBoostersAPI interface: es.edwardbelt.edgens.iapi
        Description: API for managing player boosters (temporary multipliers)
        Instance Methods:
        
        double getBoosterValueByEconomy(UUID uuid, String economy) - Gets total booster multiplier for an economy
        double getBoosterValueGlobalEnchants(UUID uuid) - Gets total enchant booster multiplier
        List<String> getActiveBoosters(UUID uuid) - Gets list of active booster IDs
        void removeBooster(UUID uuid, String boosterId) - Removes a booster
        boolean existsBooster(UUID uuid, String boosterId) - Checks if a booster exists
        String getBoosterCurrency(UUID uuid, String boosterId) - Gets the currency a booster affects
        boolean isBoosterEnchantType(UUID uuid, String boosterId) - Checks if booster affects enchants
        String getBoosterName(UUID uuid, String boosterId) - Gets the display name of a booster
        double getBoosterMultiplier(UUID uuid, String boosterId) - Gets the multiplier value
        long getBoosterDuration(UUID uuid, String boosterId) - Gets the total duration in milliseconds
        long getBoosterRemainingTime(UUID uuid, String boosterId) - Gets remaining time in milliseconds
        void setBoosterMultiplier(UUID uuid, String boosterId, double multiplier) - Sets the multiplier
        void setBoosterDuration(UUID uuid, String boosterId, long duration) - Sets the duration
        void setBoosterEnchantBooster(UUID uuid, String boosterId, boolean enchantBooster) - Sets enchant type flag
        void setBoosterEconomy(UUID uuid, String boosterId, String economy) - Sets the affected currency
        void setBoosterTimeLeft(UUID uuid, String boosterId, long timeLeft) - Sets remaining time
        void addBooster(UUID uuid, String boosterId, String boosterName, String economy, double multiplier, long duration, boolean enchantBooster, boolean saveDB) - Creates a new booster
        
        
        EdToolsBackpackAPI interface: es.edwardbelt.edgens.iapi
        Description: API for managing player backpacks
        Instance Methods:
        
        ItemStack getPlayerBackpackInInventory(Player player) - Gets the backpack item from player inventory
        Map<String, Double> getBackpackItems(UUID uuid) - Gets all items stored in backpack with quantities
        double getBackpackWeight(UUID uuid) - Gets current backpack weight/capacity used
        void sellBackpackItems(Player player) - Sells all items in the backpack
        void upgradeBackpackAsPlayer(Player player) - Upgrades the backpack to next tier
        void setBackpackUpgrade(UUID uuid, String upgrade) - Sets the backpack upgrade level
        String getBackpackUpgrade(UUID uuid) - Gets current upgrade level
        String getBackpackNextUpgrade(UUID uuid) - Gets the next available upgrade
        Set<String> getBackpackUpgrades() - Gets all available upgrade IDs
        double getBackpackUpgradeMultiplier(String upgrade) - Gets the multiplier for an upgrade
        double getBackpackUpgradeCost(String upgrade) - Gets the cost of an upgrade
        String getBackpackUpgradeCurrency(String upgrade) - Gets the currency needed for an upgrade
        double getBackpackUpgradeSize(String upgrade) - Gets the capacity size for an upgrade
        
        
        EdToolsOmniToolAPI interface: es.edwardbelt.edgens.iapi
        Description: API for managing omnitools (multi-functional tools)
        Instance Methods:
        
        void loadTool(String toolId, ConfigurationSection toolSec) - Loads a tool from configuration
        boolean isItemOmniTool(ItemStack item) - Checks if an item is an omnitool
        String getOmniToolId(ItemStack item) - Gets the tool ID from an item
        ItemStack getOmniToolItem(Player owner, String toolId) - Creates an omnitool item for a player
        ItemStack getOmniToolFromPlayer(Player player) - Gets the omnitool from player's hand
        
        
        EdToolsLuckyBlocksAPI interface: es.edwardbelt.edgens.iapi
        Description: API for managing lucky blocks
        Instance Methods:
        
        ItemStack getLuckyBlockItem(String id, Player owner) - Creates a lucky block item
        boolean isLuckyBlockUnlocked(ItemStack item) - Checks if a lucky block has been opened
        void updateLuckyBlock(Player player, ItemStack item) - Updates/refreshes a lucky block
        boolean isLuckyBlock(ItemStack item) - Checks if an item is a lucky block
        
        
        EdToolsGuisAPI interface: es.edwardbelt.edgens.iapi
        Description: API for managing custom GUIs
        Instance Methods:
        
        void openGui(Player player, String gui) - Opens a GUI for a player
        void openGui(Player player, String gui, Map<String, String> placeholders) - Opens a GUI with placeholders
        void closeGui(Player player) - Closes the player's current GUI
        void loadGui(String guiId, File guiFile) - Loads a GUI from a file
        
        
        EdToolsSellAPI interface: es.edwardbelt.edgens.iapi
        Description: API for managing item selling
        Instance Methods:
        
        void sellItem(UUID uuid, String itemId, double amount) - Sells an item for a player
        void addSellSummary(UUID uuid, String currencyId, double amount) - Adds to sell summary statistics
        double getSellSummary(UUID uuid, String currencyId) - Gets sell summary for a currency
        
        
        EdToolsLevelingAPI interface: es.edwardbelt.edgens.iapi
        Description: API for managing player levels and progression
        Instance Methods:
        
        void setLevel(UUID uuid, String levelId, double level) - Sets a player's level
        double getLevel(UUID uuid, String levelId) - Gets a player's level
        void addLevel(UUID uuid, String levelId, double level) - Adds levels to a player
        void removeLevel(UUID uuid, String levelId, double level) - Removes levels from a player
        boolean isLevel(String level) - Checks if a level type exists
        double getStartingLevel(String level) - Gets the starting level value
        boolean isAutomaticLeveling(String level) - Checks if leveling is automatic
        String getLevelName(String level) - Gets the display name of a level type
        List<String> getForEachRewards(String level) - Gets rewards given each level
        Map<Double, List<String>> getIntervalRewards(String level) - Gets rewards given at intervals
        Map<Double, List<String>> getSpecificRewards(String level) - Gets rewards at specific levels
        
        
        APIPair class: es.edwardbelt.edgens.iapi
        Description: Generic pair utility class for returning two values
        Constructor:
        
        APIPair(A a, B b) - Creates a pair with two values
        
        Instance Methods:
        
        A getValue0() - Gets the first value
        B getValue1() - Gets the second value
        
        
        EdToolsBreakBlockEvent class: es.edwardbelt.edgens.iapi.event
        Description: Event fired when a player breaks a block in EdTools zones
        Constructor:
        
        EdToolsBreakBlockEvent(Player player, Material material, String soldItem, String toolId, Vector position) - Creates the event
        
        Instance Methods (Getters):
        
        Player getPlayer() - Gets the player who broke the block
        Material getMaterial() - Gets the material of the broken block
        String getSoldItem() - Gets the sold item ID
        String getToolId() - Gets the tool ID used
        Vector getPosition() - Gets the position of the block
        HandlerList getHandlers() - Gets the handler list (Bukkit requirement)
        
        Static Methods:
        
        static HandlerList getHandlerList() - Gets the static handler list (Bukkit requirement)
        
        
        EdToolsCurrencyAddEvent class: es.edwardbelt.edgens.iapi.event
        Description: Event fired when currency is added to a player (can modify amount/multiplier)
        Constructor:
        
        EdToolsCurrencyAddEvent(UUID uuid, String currency, double amount, double multiplier) - Creates the event
        
        Instance Methods (Getters):
        
        UUID getUuid() - Gets the player's UUID
        String getCurrency() - Gets the currency ID
        double getAmount() - Gets the amount being added
        double getMultiplier() - Gets the current multiplier
        HandlerList getHandlers() - Gets the handler list (Bukkit requirement)
        
        Instance Methods (Setters):
        
        void setCurrency(String currency) - Sets the currency ID
        void setAmount(double amount) - Sets the amount
        void setMultiplier(double multiplier) - Sets the multiplier
        void addMultiplier(double multiplier) - Adds to the multiplier
        
        Static Methods:
        
        static HandlerList getHandlerList() - Gets the static handler list (Bukkit requirement)
        
        
        EdToolsEnchantTryProcEvent class: es.edwardbelt.edgens.iapi.event
        Description: Event fired when an enchant attempts to proc (can modify chance)
        Constructor:
        
        EdToolsEnchantTryProcEvent(Player player, String enchant, double chance) - Creates the event
        
        Instance Methods (Getters):
        
        Player getPlayer() - Gets the player
        String getEnchant() - Gets the enchant ID
        double getChance() - Gets the proc chance
        HandlerList getHandlers() - Gets the handler list (Bukkit requirement)
        
        Instance Methods (Setters):
        
        void setChance(double chance) - Sets the proc chance
        
        Static Methods:
        
        static HandlerList getHandlerList() - Gets the static handler list (Bukkit requirement)
        
        
        APIEnchant interface: es.edwardbelt.edgens.iapi.enchant
        Description: Interface for implementing custom enchantments
        Instance Methods:
        
        void onProc(Player player, EnchantData data) - Called when the enchant procs
        
        
        EnchantData abstract class: es.edwardbelt.edgens.iapi.enchant
        Description: Base class for enchant data passed to APIEnchant
        Constructor:
        
        EnchantData(String toolId) - Creates enchant data with tool ID
        
        Instance Methods (Getters):
        
        String getToolId() - Gets the tool ID
        
        
        CustomEnchantData class: es.edwardbelt.edgens.iapi.enchant
        Description: Extended enchant data for custom enchants with block information
        Extends: EnchantData
        Constructor:
        
        CustomEnchantData(String toolId, Material material, Vector position, String sellItem) - Creates custom enchant data
        
        Instance Methods (Getters):
        
        Material getMaterial() - Gets the block material
        Vector getPosition() - Gets the block position
        String getSellItem() - Gets the sell item ID
        String getToolId() - Inherited from EnchantData
        
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
        - Run the mineBlockAsPlayer methods asynchronously inside the Zones API. Always set by default the affectEnchants boolean to false. Also, if you are mining a block inside an enchant always set the same toolId in the mineBlockAsPlayer method as the enchant CustomEnchantData.
        - Spawn the entities asynchronously
        - Always spawn entities packet-based for the player who procced the enchant. If you spawn particles, spawn them only for the player who procced the enchant. Remember that the enchant effects must only be seen by the player.
        - If you want to move a packet-based entity, always create custom goal implementations or use existing ones. If you create custom ones, move the mob with the EdEntity#shortTp(double x, double y, double z) method.
        - Always add cool particle effects to the enchantments. The more, the better. Spawn these only to the player and asynchronously.
        - After you've created an enchant, tell the user that to set it up they should add a new file inside the plugins/EdTools/enchants folder:
            file name: <enchant_id>.yml
            file contents:
            \`\`\`
            max-chance: 0 # The max chance of the enchant. Example: 5
            max-level: 0 # The max level of the enchant. Example: 1000
            tool: 'crop-tool' # Always crop-tool
            material: '' # A Bukkit Material representing the enchantment. Example: SLIME_BALL
            type: 'api' # Always api type
            display-name: '' # Example: Slime Bunny
            cost:
              currency: farm-coins # Always farm-coins
              starting-cost: 100
              increase-cost-by: 500
            \`\`\`
    `
};

