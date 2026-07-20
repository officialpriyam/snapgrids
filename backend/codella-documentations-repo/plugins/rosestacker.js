module.exports = {
    name: 'RoseStacker',
    description: 'RoseStacker is a versatile stacking plugin created to stack entities, items, blocks, and spawners! This plugin is ideal for servers looking to enhance functionality and overall server experience, with features that improve the elements of your gameplay.',
    pluginId: 'RoseStacker',
    mavenIntegration: `
        <repositories>
            <repository>
                <id>rosewood-repo</id>
                <url>https://repo.rosewooddev.io/repository/public/</url>
            </repository>
        </repositories>
        <dependencies>
            <dependency>
                <groupId>dev.rosewood</groupId>
                <artifactId>rosestacker</artifactId>
                <version>1.5.33</version>
                <scope>provided</scope>
            </dependency>
        </dependencies>
    `,
    usage: `
        Getting an API instance
        In order to use the API, you must first acquire an API instance. An example plugin class that does this can be found below.
        
        import dev.rosewood.rosestacker.api.RoseStackerAPI;
        import org.bukkit.Bukkit;
        import org.bukkit.plugin.java.JavaPlugin;
        
        public class Example extends JavaPlugin {
            private RoseStackerAPI rsAPI;
        
            @Override
            public void onEnable() {
                if (Bukkit.getPluginManager().isPluginEnabled("RoseStacker")) {
                    this.rsAPI = RoseStackerAPI.getInstance();
                }
        
                // When you want to access the API, check if the instance is null
                if (this.rsAPI != null) {
                    // Do stuff with the API here
                }
            }
        }
        
        RoseStackerAPI class: dev.rosewood.rosestacker.api
        Instance Methods
        General Methods
        String getVersion() (annotated with @NotNull)
        boolean isEntityStackMultipleDeathEventCalled()
        
        Stack Manager Methods
        dev.rosewood.rosestacker.stack.StackingThread getStackingThread(@NotNull World world) (nullable)
        Map<UUID, dev.rosewood.rosestacker.stack.StackingThread> getStackingThreads() (annotated with @NotNull)
        Map<UUID, dev.rosewood.rosestacker.stack.StackedEntity> getStackedEntities() (annotated with @NotNull)
        Map<UUID, dev.rosewood.rosestacker.stack.StackedItem> getStackedItems() (annotated with @NotNull)
        Map<Block, dev.rosewood.rosestacker.stack.StackedBlock> getStackedBlocks() (annotated with @NotNull)
        Map<Block, dev.rosewood.rosestacker.stack.StackedSpawner> getStackedSpawners() (annotated with @NotNull)
        dev.rosewood.rosestacker.stack.StackedEntity getStackedEntity(@NotNull LivingEntity livingEntity) (nullable)
        dev.rosewood.rosestacker.stack.StackedItem getStackedItem(@NotNull Item item) (nullable)
        dev.rosewood.rosestacker.stack.StackedBlock getStackedBlock(@NotNull Block block) (nullable)
        dev.rosewood.rosestacker.stack.StackedSpawner getStackedSpawner(@NotNull Block block) (nullable)
        boolean isEntityStacked(@NotNull LivingEntity livingEntity)
        boolean isItemStacked(@NotNull Item item)
        boolean isBlockStacked(@NotNull Block block)
        boolean isSpawnerStacked(@NotNull Block block)
        void removeEntityStack(@NotNull dev.rosewood.rosestacker.stack.StackedEntity stackedEntity)
        void removeItemStack(@NotNull dev.rosewood.rosestacker.stack.StackedItem stackedItem)
        void removeBlockStack(@NotNull dev.rosewood.rosestacker.stack.StackedBlock stackedBlock)
        void removeSpawnerStack(@NotNull dev.rosewood.rosestacker.stack.StackedSpawner stackedSpawner)
        int removeAllEntityStacks()
        int removeAllItemStacks()
        dev.rosewood.rosestacker.stack.StackedEntity createEntityStack(@NotNull LivingEntity livingEntity, boolean tryStack) (nullable)
        dev.rosewood.rosestacker.stack.StackedItem createItemStack(@NotNull Item item, boolean tryStack) (nullable)
        dev.rosewood.rosestacker.stack.StackedBlock createBlockStack(@NotNull Block block, int amount) (nullable)
        dev.rosewood.rosestacker.stack.StackedSpawner createSpawnerStack(@NotNull Block block, int amount, boolean placedByPlayer) (nullable)
        dev.rosewood.rosestacker.stack.StackedSpawner createSpawnerStack(@NotNull Block block, int amount) (nullable)
        void preStackEntities(@NotNull EntityType entityType, int amount, @NotNull Location location, @NotNull SpawnReason spawnReason)
        void preStackEntities(@NotNull EntityType entityType, int amount, @NotNull Location location)
        void preStackItems(@NotNull Collection<ItemStack> items, Location location)
        dev.rosewood.rosestacker.stack.StackedItem dropItemStack(@NotNull ItemStack itemStack, int amount, @NotNull Location location, boolean dropNaturally) (nullable)
        
        Stack Settings Methods
        dev.rosewood.rosestacker.stack.settings.EntityStackSettings getEntityStackSettings(@NotNull LivingEntity entity) (annotated with @NotNull)
        dev.rosewood.rosestacker.stack.settings.EntityStackSettings getEntityStackSettings(@NotNull EntityType entityType) (annotated with @NotNull)
        dev.rosewood.rosestacker.stack.settings.EntityStackSettings getEntityStackSettings(@NotNull Material material) (nullable)
        dev.rosewood.rosestacker.stack.settings.ItemStackSettings getItemStackSettings(@NotNull Item item) (annotated with @NotNull)
        dev.rosewood.rosestacker.stack.settings.ItemStackSettings getItemStackSettings(@NotNull Material material) (annotated with @NotNull)
        dev.rosewood.rosestacker.stack.settings.BlockStackSettings getBlockStackSettings(@NotNull Block block) (nullable)
        dev.rosewood.rosestacker.stack.settings.BlockStackSettings getBlockStackSettings(@NotNull Material material) (nullable)
        dev.rosewood.rosestacker.stack.settings.SpawnerStackSettings getSpawnerStackSettings(@NotNull CreatureSpawner creatureSpawner) (nullable)
        dev.rosewood.rosestacker.stack.settings.SpawnerStackSettings getSpawnerStackSettings(@NotNull EntityType entityType) (nullable)
        
        Chunk Stacks Methods
        CompletableFuture<Set<dev.rosewood.rosestacker.stack.StackedEntity>> getChunkEntityStacks(@NotNull Collection<Chunk> chunks) (annotated with @NotNull, deprecated)
        CompletableFuture<Set<dev.rosewood.rosestacker.stack.StackedItem>> getChunkItemStacks(@NotNull Collection<Chunk> chunks) (annotated with @NotNull, deprecated)
        CompletableFuture<Set<dev.rosewood.rosestacker.stack.StackedBlock>> getChunkBlockStacks(@NotNull Collection<Chunk> chunks) (annotated with @NotNull, deprecated)
        CompletableFuture<Set<dev.rosewood.rosestacker.stack.StackedSpawner>> getChunkSpawnerStacks(@NotNull Collection<Chunk> chunks) (annotated with @NotNull, deprecated)
        List<dev.rosewood.rosestacker.stack.StackedEntity> getStackedEntities(@NotNull Collection<Chunk> chunks) (annotated with @NotNull)
        List<dev.rosewood.rosestacker.stack.StackedItem> getStackedItems(@NotNull Collection<Chunk> chunks) (annotated with @NotNull)
        List<dev.rosewood.rosestacker.stack.StackedBlock> getStackedBlocks(@NotNull Collection<Chunk> chunks) (annotated with @NotNull)
        List<dev.rosewood.rosestacker.stack.StackedSpawner> getStackedSpawners(@NotNull Collection<Chunk> chunks) (annotated with @NotNull)
        
        Loot Generation Methods
        dev.rosewood.rosestacker.event.EntityStackMultipleDeathEvent.EntityDrops getStackedEntityLoot(@NotNull dev.rosewood.rosestacker.stack.StackedEntity stackedEntity)
        dev.rosewood.rosestacker.event.EntityStackMultipleDeathEvent.EntityDrops getStackedEntityLoot(@NotNull dev.rosewood.rosestacker.stack.StackedEntity stackedEntity, int count, boolean includeMainEntity)
        dev.rosewood.rosestacker.event.EntityStackMultipleDeathEvent.EntityDrops getStackedEntityLoot(@NotNull dev.rosewood.rosestacker.stack.StackedEntity stackedEntity, int count, boolean includeMainEntity, int lootingModifier)
        
        
        StackingThread class: dev.rosewood.rosestacker.stack
        Public Methods
        World getTargetWorld()
        
        Interface Methods (StackingLogic, AutoCloseable)
        void tryUnstackEntity(dev.rosewood.rosestacker.stack.StackedEntity stackedEntity) (overrides)
        void close() (overrides)
        Map<UUID, dev.rosewood.rosestacker.stack.StackedEntity> getStackedEntities() (overrides)
        Map<UUID, dev.rosewood.rosestacker.stack.StackedItem> getStackedItems() (overrides)
        Map<Block, dev.rosewood.rosestacker.stack.StackedBlock> getStackedBlocks() (overrides)
        Map<Block, dev.rosewood.rosestacker.stack.StackedSpawner> getStackedSpawners() (overrides)
        dev.rosewood.rosestacker.stack.StackedEntity getStackedEntity(LivingEntity livingEntity) (overrides)
        dev.rosewood.rosestacker.stack.StackedItem getStackedItem(Item item) (overrides)
        dev.rosewood.rosestacker.stack.StackedBlock getStackedBlock(Block block) (overrides)
        dev.rosewood.rosestacker.stack.StackedSpawner getStackedSpawner(Block block) (overrides)
        boolean isEntityStacked(LivingEntity livingEntity) (overrides)
        boolean isItemStacked(Item item) (overrides)
        boolean isBlockStacked(Block block) (overrides)
        boolean isSpawnerStacked(Block block) (overrides)
        void removeEntityStack(dev.rosewood.rosestacker.stack.StackedEntity stackedEntity) (overrides)
        void removeItemStack(dev.rosewood.rosestacker.stack.StackedItem stackedItem) (overrides)
        void removeBlockStack(dev.rosewood.rosestacker.stack.StackedBlock stackedBlock) (overrides)
        void removeSpawnerStack(dev.rosewood.rosestacker.stack.StackedSpawner stackedSpawner) (overrides)
        int removeAllEntityStacks() (overrides)
        int removeAllItemStacks() (overrides)
        void updateStackedEntityKey(LivingEntity oldKey, dev.rosewood.rosestacker.stack.StackedEntity stackedEntity) (overrides)
        dev.rosewood.rosestacker.stack.StackedEntity splitEntityStack(dev.rosewood.rosestacker.stack.StackedEntity stackedEntity) (overrides)
        dev.rosewood.rosestacker.stack.StackedItem splitItemStack(dev.rosewood.rosestacker.stack.StackedItem stackedItem, int newSize) (overrides)
        dev.rosewood.rosestacker.stack.StackedEntity createEntityStack(LivingEntity livingEntity, boolean tryStack) (overrides)
        dev.rosewood.rosestacker.stack.StackedItem createItemStack(Item item, boolean tryStack) (overrides)
        dev.rosewood.rosestacker.stack.StackedBlock createBlockStack(Block block, int amount) (overrides)
        dev.rosewood.rosestacker.stack.StackedSpawner createSpawnerStack(Block block, int amount, boolean placedByPlayer) (overrides)
        void addEntityStack(dev.rosewood.rosestacker.stack.StackedEntity stackedEntity) (overrides)
        void addItemStack(dev.rosewood.rosestacker.stack.StackedItem stackedItem) (overrides)
        void preStackEntities(EntityType entityType, int amount, Location location, SpawnReason spawnReason) (overrides)
        void preStackEntities(EntityType entityType, int amount, Location location) (overrides)
        void preStackItems(Collection<ItemStack> items, Location location, boolean dropNaturally) (overrides)
        dev.rosewood.rosestacker.stack.StackedItem dropItemStack(ItemStack itemStack, int amount, Location location, boolean dropNaturally) (overrides)
        void loadChunkBlocks(Chunk chunk) (overrides)
        void loadChunkEntities(List<Entity> entities) (overrides)
        void saveChunkBlocks(Chunk chunk, boolean clearStored) (overrides)
        void saveChunkEntities(List<Entity> entities, boolean clearStored) (overrides)
        <T extends dev.rosewood.rosestacker.stack.Stack<?>> void saveChunkEntityStacks(List<T> stacks, boolean clearStored) (overrides)
        void saveAllData(boolean clearStored) (overrides)
        void tryStackEntity(dev.rosewood.rosestacker.stack.StackedEntity stackedEntity) (overrides)
        void tryStackItem(dev.rosewood.rosestacker.stack.StackedItem stackedItem) (overrides)
        
        
        StackedEntity class: dev.rosewood.rosestacker.stack
        Constructors
        StackedEntity(LivingEntity entity, dev.rosewood.rosestacker.nms.storage.StackedEntityDataStorage stackedEntityDataStorage, boolean updateDisplay)
        StackedEntity(LivingEntity entity, dev.rosewood.rosestacker.nms.storage.StackedEntityDataStorage stackedEntityDataStorage)
        StackedEntity(LivingEntity entity)
        
        Public Methods
        boolean checkNPC()
        LivingEntity getEntity()
        void updateEntity()
        void increaseStackSize(LivingEntity entity)
        void increaseStackSize(LivingEntity entity, boolean updateDisplay)
        void increaseStackSize(int amount, boolean updateDisplay)
        void increaseStackSize(dev.rosewood.rosestacker.nms.storage.StackedEntityDataStorage serializedStackedEntities)
        dev.rosewood.rosestacker.stack.StackedEntity decreaseStackSize()
        dev.rosewood.rosestacker.nms.storage.StackedEntityDataStorage getStackedEntityNBT() (deprecated)
        dev.rosewood.rosestacker.nms.storage.StackedEntityDataStorage getDataStorage()
        void setStackedEntityNBT(dev.rosewood.rosestacker.nms.storage.StackedEntityDataStorage stackedEntityDataStorage) (deprecated)
        void setDataStorage(dev.rosewood.rosestacker.nms.storage.StackedEntityDataStorage stackedEntityDataStorage)
        void dropStackLoot(Collection<ItemStack> existingLoot, int droppedExp)
        void dropPartialStackLoot(int count, Collection<ItemStack> existingLoot, int droppedExp)
        void dropPartialStackLoot(Collection<LivingEntity> internalEntities) (deprecated)
        void dropPartialStackLoot(Collection<dev.rosewood.rosestacker.nms.storage.EntityDataEntry> internalEntityData, Collection<ItemStack> existingLoot, int droppedExp) (deprecated)
        dev.rosewood.rosestacker.event.EntityStackMultipleDeathEvent.EntityDrops calculateEntityDrops(int count, boolean includeMainEntity, int entityExpValue) (annotated with @ApiStatus.Internal)
        dev.rosewood.rosestacker.event.EntityStackMultipleDeathEvent.EntityDrops calculateEntityDrops(int count, boolean includeMainEntity, int entityExpValue, Integer lootingModifier) (annotated with @ApiStatus.Internal)
        dev.rosewood.rosestacker.event.EntityStackMultipleDeathEvent.EntityDrops calculateEntityDrops(Collection<dev.rosewood.rosestacker.nms.storage.EntityDataEntry> internalEntities, int entityExpValue, Integer lootingModifier, LivingEntity mainEntity, dev.rosewood.rosestacker.event.EntityStackMultipleDeathEvent.EntityDrops mainEntityDrops, Integer originalStackSize, Integer entityKillCount) (annotated with @ApiStatus.Internal)
        dev.rosewood.rosestacker.event.EntityStackMultipleDeathEvent.EntityDrops calculateEntityDrops(int count, boolean includeMainEntity, int entityExpValue, Integer lootingModifier, LivingEntity mainEntity, dev.rosewood.rosestacker.event.EntityStackMultipleDeathEvent.EntityDrops mainEntityDrops, Integer originalStackSize, Integer entityKillCount) (annotated with @ApiStatus.Internal)
        boolean shouldStayStacked()
        int getStackSize() (overrides)
        Location getLocation() (overrides)
        String getDisplayName()
        boolean isDisplayNameVisible()
        void updateDisplay() (overrides)
        dev.rosewood.rosestacker.stack.settings.EntityStackSettings getStackSettings() (overrides)
        int compareTo(dev.rosewood.rosestacker.stack.StackedEntity stack2) (overrides)
        boolean isEntireStackKilledOnDeath(@Nullable Player overrideKiller)
        boolean isEntireStackKilledOnDeath()
        void killEntireStack(@Nullable EntityDeathEvent event)
        void killEntireStack()
        void killPartialStack(@Nullable EntityDeathEvent event, int amount)
        boolean areMultipleEntitiesDying(@NotNull EntityDeathEvent event)
        boolean hasMoved()
        void resetHasMoved()
        
        StackedItem class: dev.rosewood.rosestacker.stack
        Constructors
        StackedItem(int size, Item item, boolean updateDisplay)
        StackedItem(int size, Item item)
        
        Instance Methods
        Item getItem()
        void updateItem()
        void increaseStackSize(int amount, boolean updateDisplay)
        void setStackSize(int size)
        int getAge()
        int getStackSize() (overrides)
        Location getLocation() (overrides)
        void updateDisplay() (overrides)
        dev.rosewood.rosestacker.stack.settings.ItemStackSettings getStackSettings() (overrides)
        int compareTo(dev.rosewood.rosestacker.stack.StackedItem stack2) (overrides)
        boolean hasMoved()
        
        
        StackedSpawner class: dev.rosewood.rosestacker.stack
        Constructors
        StackedSpawner(int size, Block spawner, boolean placedByPlayer, boolean updateDisplay)
        StackedSpawner(int size, Block spawner, boolean placedByPlayer)
        StackedSpawner(int size, Location location) (special constructor for converters)
        
        Public Methods
        dev.rosewood.rosestacker.nms.spawner.StackedSpawnerTile getSpawnerTile()
        CreatureSpawner getSpawner() (annotated with @implNote)
        Block getBlock()
        void kickOutGuiViewers()
        void increaseStackSize(int amount)
        void setStackSize(int size)
        void openGui(Player player)
        List<Class<? extends dev.rosewood.rosestacker.stack.settings.conditions.spawner.ConditionTag>> getLastInvalidConditions()
        int getStackSize() (overrides)
        Location getLocation() (overrides)
        void updateDisplay() (overrides)
        Location getHologramLocation()
        dev.rosewood.rosestacker.stack.settings.SpawnerStackSettings getStackSettings() (overrides)
        boolean isPlacedByPlayer()
        void updateSpawnerProperties(boolean resetDelay)
        
        
        StackedBlock class: dev.rosewood.rosestacker.stack
        Constructors
        StackedBlock(int size, Block block, boolean updateDisplay)
        StackedBlock(int size, Block block)
        
        Instance Methods
        Block getBlock()
        boolean isLocked()
        void kickOutGuiViewers()
        void increaseStackSize(int amount)
        void setStackSize(int size)
        void openGui(Player player)
        int getStackSize() (overrides)
        Location getLocation() (overrides)
        void updateDisplay() (overrides)
        Location getHologramLocation()
        dev.rosewood.rosestacker.stack.settings.BlockStackSettings getStackSettings() (overrides)
    `
};