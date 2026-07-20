module.exports = {
    name: 'WildStacker',
    description: 'WildStacker is suitable for servers with a lot of entities and drops which want to reduce the server-lag that they cause without changing the game experience. With our advanced algorithms, many entities and drops can be stacked at the same time without causing any lag!',
    pluginId: 'WildStacker',
    mavenIntegration: `
        <repositories>
            <repository>
                <id>bg-repo</id>
                <url>https://repo.bg-software.com/repository/api/</url>
            </repository>
        </repositories>
        
        <dependencies>
            <dependency>
                <groupId>com.bgsoftware</groupId>
                <artifactId>WildStackerAPI</artifactId>
                <version>2025.1</version>
            </dependency>
        </dependencies>
    `,
    usage: `
        WildStacker API Documentation
        WildStackerAPI class: com.bgsoftware.wildstacker.api
        Static Methods
        
        static void setPluginInstance(WildStacker instance) (Set plugin instance - do not use on your own)
        static StackedItem getStackedItem(Item item) (Get stacked-item object for an item)
        static int getItemAmount(Item item) (Get stacked amount for an item)
        static StackedEntity getStackedEntity(LivingEntity livingEntity) (Get stacked-entity object for a living entity)
        static int getEntityAmount(LivingEntity livingEntity) (Get stacked amount for an entity)
        static StackedSpawner getStackedSpawner(CreatureSpawner spawner) (Get stacked-spawner object for a spawner)
        static int getSpawnersAmount(CreatureSpawner spawner) (Get stacked amount for a spawner)
        static StackedBarrel getStackedBarrel(Block block) (Get stacked-barrel object for a block)
        static int getBarrelAmount(Block block) (Get stacked amount for a barrel)
        static Entity spawnEntityWithoutStacking(Location location, EntityType type) (Spawn entity without stacking it)
        static LootTable getLootTable(LivingEntity livingEntity) (Get loot table of an entity)
        static WildStacker getWildStacker() (Get the WildStacker instance)
        
        Core Object Interfaces
        StackedObject<T> interface: com.bgsoftware.wildstacker.api.objects
        Interface Methods
        
        Location getLocation() (Get location of the object)
        World getWorld() (Get world of the object)
        int getStackAmount() (Get stack amount)
        void setStackAmount(int stackAmount, boolean updateName) (Update stack amount)
        int increaseStackAmount(int stackAmount, boolean updateName) (Increase stack amount - returns new amount)
        int decreaseStackAmount(int stackAmount, boolean updateName) (Decrease stack amount - returns new amount)
        int getStackLimit() (Get stack limit)
        int getMergeRadius() (Get merge radius of the object)
        boolean isBlacklisted() (Check if object is blacklisted)
        boolean isWhitelisted() (Check if object is whitelisted)
        boolean isWorldDisabled() (Check if object's world is disabled)
        boolean isCached() (Check if object is cached)
        void remove() (Remove stack object from cache and server)
        void updateName() (Update name of the object)
        @Deprecated boolean canStackInto(StackedObject stackedObject) (See runStackCheck)
        StackCheckResult canGetStacked(int amountToAdd) (Check if object can be stacked)
        StackCheckResult runStackCheck(StackedObject stackedObject) (Check if can stack into another object)
        @Deprecated void runStackAsync(Consumer<Optional<T>> result) (Use runStack() instead)
        Optional<T> runStack() (Stack this object into other objects around it)
        @Deprecated T tryStack() (See runStackAsync)
        StackResult runStack(StackedObject stackedObject) (Stack into another object)
        @Deprecated boolean tryStackInto(StackedObject stackedObject) (See runStackAsync)
        UnstackResult runUnstack(int amount) (Unstack this object)
        UnstackResult runUnstack(int amount, Entity entity) (Unstack with entity cause)
        @Deprecated boolean tryUnstack(int amount) (See runUnstack)
        boolean isSimilar(StackedObject stackedObject) (Check if similar to another object)
        void spawnStackParticle(boolean checkEnabled) (Spawn stacking particle)
        
        StackedEntity interface: com.bgsoftware.wildstacker.api.objects
        Interface Methods (extends AsyncStackedObject<LivingEntity>, UpgradeableStackedObject)
        
        LivingEntity getLivingEntity() (Get bukkit living-entity object)
        UUID getUniqueId() (Get UUID of the living-entity)
        EntityType getType() (Get entity-type of the living-entity)
        double getHealth() (Get health of the living-entity)
        void setHealth(double health) (Set health to the living-entity)
        String getCustomName() (Get custom name of the living-entity)
        void setCustomName(String customName) (Set custom name to the living-entity)
        boolean isCustomNameVisible() (Check if name is visible)
        void setCustomNameVisible(boolean visible) (Set name visibility)
        void runSpawnerStackAsync(StackedSpawner stackedSpawner, Consumer<Optional<LivingEntity>> result) (Try to stack as if spawned by spawner)
        @Deprecated LivingEntity trySpawnerStack(StackedSpawner stackedSpawner) (Use runSpawnerStackAsync)
        StackedEntity spawnDuplicate(int amount) (Spawn duplicate with specific stack amount)
        StackedEntity spawnDuplicate(int amount, SpawnCause spawnCause) (Spawn duplicate with spawn cause)
        void spawnCorpse() (Spawn corpse for this entity)
        List<ItemStack> getDrops(int lootBonusLevel) (Get drops with fortune level - SHOULD BE USED ASYNC)
        List<ItemStack> getDrops(int lootBonusLevel, int stackAmount) (Get drops with fortune and stack size - SHOULD BE USED ASYNC)
        void setDrops(List<ItemStack> itemStacks) (Set temporary loot table)
        @Deprecated void setTempLootTable(List<ItemStack> itemStacks) (See setDrops)
        void setDropsMultiplier(int multiplier) (Set loot multiplier)
        @Deprecated void setLootMultiplier(int multiplier) (See setDropsMultiplier)
        int getExp(int stackAmount, int defaultExp) (Get exp with stack size)
        SpawnCause getSpawnCause() (Get spawn cause of entity)
        void setSpawnCause(SpawnCause spawnCause) (Set spawn cause)
        boolean isNerfed() (Check if entity is nerfed)
        void setNerfed(boolean nerfed) (Set entity nerfed state)
        void updateNerfed() (Update nerfed state using isNerfed flag)
        boolean isNameBlacklisted() (Check if name is blacklisted)
        boolean isInstantKill(EntityDamageEvent.DamageCause damageCause) (Check if should be instant-killed)
        int getDefaultUnstack() (Get default unstack amount)
        boolean hasNameTag() (Check if entity has name tag)
        boolean hasFlag(EntityFlag entityFlag) (Check if entity has flag)
        <T> T getFlag(EntityFlag entityFlag) (Get flag value)
        void setFlag(EntityFlag entityFlag, Object value) (Set flag value)
        void removeFlag(EntityFlag entityFlag) (Remove flag from memory)
        <T> T getAndRemoveFlag(EntityFlag entityFlag) (Get and remove flag)
        void clearFlags() (Clear all flags from entity)
        void setSpawnCorpse(boolean spawnCorpse) (Set whether to spawn corpse on death)
        
        StackedItem interface: com.bgsoftware.wildstacker.api.objects
        Interface Methods (extends AsyncStackedObject<Item>)
        
        Item getItem() (Get bukkit item object)
        UUID getUniqueId() (Get UUID of the item)
        String getCustomName() (Get custom name of the item)
        void setCustomName(String customName) (Set custom name to the item)
        boolean isCustomNameVisible() (Check if name is visible)
        void setCustomNameVisible(boolean visible) (Set name visibility)
        ItemStack getItemStack() (Get duplicated item stack with stacked amount)
        void setItemStack(ItemStack itemStack) (Set item stack - null/air calls remove)
        void giveItemStack(Inventory inventory) (Add duplicated item to inventory respecting settings)
        
        StackedBarrel interface: com.bgsoftware.wildstacker.api.objects
        Interface Methods (extends StackedObject<Block>)
        
        Block getBlock() (Get bukkit block object)
        Material getType() (Get material type of block inside barrel)
        short getData() (Get data value of block inside barrel)
        void createDisplayBlock() (Display block armor-stand inside cauldron)
        void removeDisplayBlock() (Destroy block armor-stand inside cauldron)
        ArmorStand getDisplayBlock() (Get block armor-stand inside cauldron)
        ItemStack getBarrelItem(int amount) (Get block as item-stack with specified amount)
        
        StackedSpawner interface: com.bgsoftware.wildstacker.api.objects
        Interface Methods (extends StackedObject<CreatureSpawner>, UpgradeableStackedObject)
        
        CreatureSpawner getSpawner() (Get bukkit creature-spawner object)
        EntityType getSpawnedType() (Get spawned-type of the creature-spawner)
        LivingEntity getLinkedEntity() (Get linked entity - may be null)
        void setLinkedEntity(LivingEntity linkedEntity) (Set linked entity)
        List<StackedSpawner> getNearbySpawners() (Get nearby stackable spawners in merge range)
        ItemStack getDropItem() (Get drop item of the spawner)
        ItemStack getDropItem(int amount) (Get drop item with specified amount)
        
        StackedSnapshot interface: com.bgsoftware.wildstacker.api.objects
        Interface Methods
        
        Map.Entry<Integer, EntityType> getStackedSpawner(Location location) (Get spawner info for location)
        boolean isStackedSpawner(Location location) (Check if location has spawner data)
        @Deprecated Map.Entry<Integer, Material> getStackedBarrel(Location location) (See getStackedBarrelItem)
        Map.Entry<Integer, ItemStack> getStackedBarrelItem(Location location) (Get barrel info for location)
        boolean isStackedBarrel(Location location) (Check if location has barrel data)
        Map<Location, Map.Entry<Integer, EntityType>> getAllSpawners() (Get all spawners in chunk)
        Map<Location, Map.Entry<Integer, Material>> getAllBarrels() (Get all barrels in chunk)
        Map<Location, Map.Entry<Integer, ItemStack>> getAllBarrelsItems() (Get all barrels with items in chunk)
        
        Nested Enum
        
        SnapshotOptions { LOAD_SPAWNERS, LOAD_BARRELS }
        
        UnloadedStackedObject interface: com.bgsoftware.wildstacker.api.objects
        Interface Methods
        
        Location getLocation() (Get location of the object)
        World getWorld() (Get world of the object)
        int getStackAmount() (Get stack amount)
        void setStackAmount(int stackAmount, boolean updateName) (Update stack amount)
        void remove() (Remove stack object from cache and server)
        
        UnloadedStackedBarrel interface: com.bgsoftware.wildstacker.api.objects
        Interface Methods (extends UnloadedStackedObject)
        
        ItemStack getBarrelItem(int amount) (Get block as item-stack with specified amount)
        
        UnloadedStackedSpawner interface: com.bgsoftware.wildstacker.api.objects
        Interface Methods (extends UnloadedStackedObject)
        
        SpawnerUpgrade getUpgrade() (Get upgrade - returns default if none)
        void setUpgrade(SpawnerUpgrade spawnerUpgrade) (Set upgrade - null to remove)
        
        UpgradeableStackedObject interface: com.bgsoftware.wildstacker.api.objects
        Interface Methods
        
        SpawnerUpgrade getUpgrade() (Get upgrade - returns default if none)
        void setUpgrade(SpawnerUpgrade spawnerUpgrade) (Set upgrade - null to remove)
        void setUpgrade(SpawnerUpgrade spawnerUpgrade, @Nullable Player player) (Set upgrade with player)
        boolean isDefaultUpgrade() (Check if has default upgrade)
        
        LootTable interface: com.bgsoftware.wildstacker.api.loot
        Interface Methods
        
        List<ItemStack> getDrops(StackedEntity stackedEntity, int lootBonusLevel, int stackAmount) (Get vanilla drops with fortune and stack size)
        List<ItemStack> getDrops(LootEntityAttributes lootEntityAttributes, int lootBonusLevel, int stackAmount) (Get drops for loot entity attributes)
        int getExp(StackedEntity stackedEntity, int stackAmount) (Get vanilla exp - must be sync in 1.19+)
        int getExp(LootEntityAttributes lootEntityAttributes, int stackAmount) (Get exp for loot entity attributes - must be sync in 1.19+)
        
        Event Classes
        StackEvent abstract class: com.bgsoftware.wildstacker.api.events (Base event for all stack events)
        Constructors
        
        StackEvent(StackedObject object, StackedObject target)
        
        Public Methods
        
        boolean isCancelled() (overrides)
        void setCancelled(boolean cancelled) (overrides)
        
        UnstackEvent abstract class: com.bgsoftware.wildstacker.api.events (Base event for all unstack events)
        Constructors
        
        UnstackEvent(StackedObject object, Entity unstackSource, int unstackAmount)
        
        Public Methods
        
        Entity getUnstackSource() (Get source for unstack - can be null)
        boolean isCancelled() (overrides)
        void setCancelled(boolean cancelled) (overrides)
        
        EntityStackEvent class: com.bgsoftware.wildstacker.api.events (Called when entity is stacked into another entity)
        Constructors
        
        EntityStackEvent(StackedEntity entity, StackedEntity target)
        
        Static Methods
        
        static HandlerList getHandlerList()
        
        Public Methods
        
        StackedEntity getEntity() (Get original entity)
        StackedEntity getTarget() (Get entity that is stacked)
        HandlerList getHandlers() (overrides)
        
        EntityUnstackEvent class: com.bgsoftware.wildstacker.api.events (Called when entity is unstacked)
        Constructors
        
        EntityUnstackEvent(StackedEntity entity, Entity unstackSource, int unstackAmount)
        
        Static Methods
        
        static HandlerList getHandlerList()
        
        Public Methods
        
        StackedEntity getEntity() (Get entity that is unstacked)
        int getAmount() (Get unstack amount)
        void setAmount(int unstackAmount) (Set unstack amount)
        HandlerList getHandlers() (overrides)
        
        ItemStackEvent class: com.bgsoftware.wildstacker.api.events (Called when item is stacked into another item)
        Constructors
        
        ItemStackEvent(StackedItem item, StackedItem target)
        
        Static Methods
        
        static HandlerList getHandlerList()
        
        Public Methods
        
        StackedItem getItem() (Get original item)
        StackedItem getTarget() (Get item that is stacked)
        HandlerList getHandlers() (overrides)
        
        SpawnerStackEvent class: com.bgsoftware.wildstacker.api.events (Called when spawner is stacked into another spawner)
        Constructors
        
        SpawnerStackEvent(StackedSpawner spawner, StackedSpawner target)
        
        Static Methods
        
        static HandlerList getHandlerList()
        
        Public Methods
        
        StackedSpawner getSpawner() (Get original spawner)
        StackedSpawner getTarget() (Get spawner that is stacked)
        HandlerList getHandlers() (overrides)
        
        SpawnerUnstackEvent class: com.bgsoftware.wildstacker.api.events (Called when spawner is unstacked)
        Constructors
        
        SpawnerUnstackEvent(StackedSpawner spawner, Entity unstackSource, int unstackAmount)
        
        Static Methods
        
        static HandlerList getHandlerList()
        
        Public Methods
        
        StackedSpawner getSpawner() (Get spawner that is unstacked)
        int getAmount() (Get unstack amount)
        HandlerList getHandlers() (overrides)
        
        DuplicateSpawnEvent class: com.bgsoftware.wildstacker.api.events (Called when duplicate of entity is spawned)
        Constructors
        
        DuplicateSpawnEvent(StackedEntity stackedEntity, StackedEntity duplicate)
        
        Static Methods
        
        static HandlerList getHandlerList()
        
        Public Methods
        
        StackedEntity getEntity() (Get original entity)
        StackedEntity getDuplicate() (Get duplicated entity)
        HandlerList getHandlers() (overrides)
        
        SpawnerUpgradeEvent class: com.bgsoftware.wildstacker.api.events (Called when spawner is upgraded)
        Constructors
        
        SpawnerUpgradeEvent(StackedSpawner stackedSpawner, SpawnerUpgrade spawnerUpgrade)
        SpawnerUpgradeEvent(StackedSpawner stackedSpawner, SpawnerUpgrade spawnerUpgrade, @Nullable Player player)
        
        Static Methods
        
        static HandlerList getHandlerList()
        
        Public Methods
        
        StackedSpawner getSpawner() (Get spawner that was upgraded)
        SpawnerUpgrade getSpawnerUpgrade() (Get new upgrade)
        Optional<Player> getPlayer() (Get player that upgraded spawner)
        HandlerList getHandlers() (overrides)
    `
};