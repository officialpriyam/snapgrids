module.exports = {
    name: 'ItemsAdder',
    description: 'ItemsAdder is a Minecraft plugin that allows server owners to add custom items, blocks, cosmetics, and more. It achieves this by downloading a resource pack.',
    pluginId: 'ItemsAdder',
    mavenIntegration: `
        <repositories>
            <repository>
                <id>matteodev</id>
                <url>https://maven.devs.beer/</url>
            </repository>
        </repositories>
        <dependencies>
            <dependency>
                <groupId>dev.lone</groupId>
                <artifactId>api-itemsadder</artifactId>
                <version>4.0.10</version>
                <scope>provided</scope>
            </dependency>
        </dependencies>
    `,
    usage: `
        ItemsAdder class: dev.lone.itemsadder.api
        Main Class Methods
        static boolean areItemsLoaded() (deprecated)
        static boolean isCustomItem(ItemStack itemStack) (deprecated)
        static boolean isCustomItem(String customItemName) (deprecated)
        static ItemStack getCustomItem(String namespacedId) (deprecated)
        static void placeCustomBlock(Location location, ItemStack itemStack) (deprecated)
        static void removeCustomBlock(Location location) (deprecated)
        static ItemStack getCustomBlockByFaces(Material material, HashMap<BlockFace, Boolean> blockFaces) (deprecated)
        static boolean isCustomBlock(Block block) (deprecated)
        static List<ItemStack> getCustomBlockLoot(Block block, boolean includeSelfBlock) (deprecated)
        static List<ItemStack> getCustomBlockLoot(Block block) (deprecated)
        static List<ItemStack> getCustomBlockLoot(Block block, ItemStack tool, boolean includeSelfBlock) (deprecated)
        static void placeCustomCrop(Location location, ItemStack seed) (deprecated)
        static boolean isCustomCrop(Block block) (deprecated)
        static String getCustomSeedNameFromCrop(Block block) (deprecated)
        static ItemStack getCustomBlock(Block block) (deprecated)
        static boolean matchCustomItemName(ItemStack itemStack, String customItemName) (deprecated)
        static boolean isFurniture(Entity entity) (deprecated)
        static String getCustomItemName(ItemStack itemStack) (deprecated)
        static int getCustomItemUsages(ItemStack itemStack) (deprecated)
        static ItemStack setCustomItemDurability(ItemStack item, int durability) (deprecated)
        static ItemStack setCustomItemMaxDurability(ItemStack item, int maxDurability) (deprecated)
        static int getCustomItemDurability(ItemStack itemStack) (deprecated)
        static int getCustomItemMaxDurability(ItemStack itemStack) (deprecated)
        static List<String> getNamespacedBlocksNamesInConfig(String searchStr) (deprecated)
        static List<String> getNamespacedBlocksNamesInConfig() (deprecated)
        static BlockData getCustomBlockBlockData(ItemStack customBlock, boolean lightweight) (deprecated)
        static boolean playTotemAnimation(Player player, String namespacedId)
        static void setLiquid(String namespacedID, Location location) (deprecated)
        static String getLiquidName(Location location) (deprecated, nullable)
        static boolean hasKeepOnDeath(ItemStack itemStack)
        static boolean hasKeepOnDeath(String namespacedId)
        static void applyResourcepack(Player player)
        static List<CustomStack> getAllItems()
        static List<CustomStack> getAllItems(String namespace)
        static List<CustomStack> getAllItems(Material material)
        static boolean isCustomRecipe(NamespacedKey namespacedKey)
        static boolean isCustomRecipe(String namespacedKey)
        static String getPackUrl(boolean appendHash) (nullable)
        
        Advanced Inner Class Methods
        static BlockData getBlockDataByInternalId(int id) (deprecated, nullable)
        static void injectItemModifier(Plugin plugin, String namespacedId, ModifierHandler modifier)
        static void injectItemModifier(Plugin plugin, ModifierHandler modifier)
        static String getItemModelResourceLocation(String namespacedId) (nullable)
        
        ModifierHandler Functional Interface Method
        ItemStack call(String namespacedId, ItemStack par)
    
        CustomStack class: dev.lone.itemsadder.api 
        Static Methods
        static Set<String> getNamespacedIdsInRegistry()
        static boolean isInRegistry(String namespacedId)
        static dev.lone.itemsadder.api.CustomStack byItemStack(ItemStack itemStack) (nullable)
        static dev.lone.itemsadder.api.CustomStack getInstance(String namespacedID) (nullable)
        
        Instance Methods
        ItemStack getItemStack()
        String getNamespace()
        String getId()
        String getNamespacedID()
        String getModelPath()
        String getConfigPath()
        FileConfiguration getConfig()
        String getPermission() (nullable)
        boolean hasPermission()
        boolean matchNamespacedID(dev.lone.itemsadder.api.CustomStack other)
        boolean hasAutoGeneratedModel()
        List<String> getTextures()
        boolean isBlockAllEnchants()
        boolean hasUsagesAttribute()
        void setUsages(int amount)
        void reduceUsages(int amount)
        int getUsages()
        boolean hasCustomDurability()
        int getDurability()
        void setDurability(int durability)
        void setMaxDurability(int maxDurability)
        int getMaxDurability()
        void setAttributeModifier(String attributeModifier, String slotStr, double value)
        void setDisplayName(String displayName)
        String getDisplayName()
        Component itemName()
        double getDamageMainhand()
        void updateAttackDamageLore(String slot)
        void updateAttackSpeedLore(String slot)
        boolean isBlock()
        boolean drop(Location loc)
        
        
        CustomBlock class extends CustomStack: dev.lone.itemsadder.api 
        Static Methods
        static Set<String> getNamespacedIdsInRegistry()
        static boolean isInRegistry(String namespacedId)
        static dev.lone.itemsadder.api.CustomBlock getInstance(String namespacedID) (nullable)
        static dev.lone.itemsadder.api.CustomBlock byItemStack(ItemStack itemStack) (nullable)
        static dev.lone.itemsadder.api.CustomBlock place(String namespacedId, Location location) (nullable)
        static dev.lone.itemsadder.api.CustomBlock byAlreadyPlaced(Block block) (nullable)
        static boolean playBreakEffect(Block bukkitBlock)
        static boolean playBreakSound(Block bukkitBlock)
        static boolean playBreakParticles(Block bukkitBlock)
        static boolean playPlaceSound(Block bukkitBlock)
        static boolean remove(Location location)
        static BlockData getBaseBlockData(String namespacedID) (nullable)
        static List<ItemStack> getLoot(Block bukkitBlock, @Nullable ItemStack tool, boolean includeSelfBlock)
        
        Instance Methods
        dev.lone.itemsadder.api.CustomBlock place(Location location)
        boolean remove()
        boolean playBreakEffect()
        boolean playBreakSound()
        boolean playBreakParticles()
        boolean playPlaceSound()
        BlockData generateBlockData() (deprecated, nullable)
        BlockData getBaseBlockData() (nullable)
        Block getBlock()
        boolean isPlaced()
        List<ItemStack> getLoot(boolean includeSelfBlock)
        List<ItemStack> getLoot()
        List<ItemStack> getLoot(@Nullable ItemStack tool, boolean includeSelfBlock)
        int getOriginalLightLevel()
        void setCurrentLightLevel(int level)
        
        Advanced Inner Class Static Methods
        static String getInCustomRegion(Location location) (nullable)
        static void placeInCustomRegion(@NotNull dev.lone.itemsadder.api.CustomBlock customBlock, Location location)
        static boolean placeInCustomRegion(String namespacedId, Location location)
        static boolean removeFromCustomRegion(Location location)
        static void deleteAllCustomBlocksInChunk(Chunk chunk)
        static void deleteAllCustomBlocksInChunk(Chunk chunk, boolean removeVanillaBlock, boolean sendChunkPacket)
        static List<Location> getAllBlocksLocationsList(Chunk chunk) (nullable)
        static Map<Location, String> getAllBlocksLocations(Chunk chunk) (nullable)
        static void runActionOnBlocks(Chunk chunk, BiConsumer<String, Location> action)
    
        CustomCrop class: dev.lone.itemsadder.api
        Static Methods
        static dev.lone.itemsadder.api.CustomCrop place(String seed_namespacedId, Location location) (nullable)
        static dev.lone.itemsadder.api.CustomCrop byAlreadyPlaced(Block block) (nullable)
        static boolean isSeed(ItemStack itemStack)
        static List<ItemStack> getLoot(Block block, @Nullable ItemStack toolUsed) (nullable)
        static List<ItemStack> getLoot(Block block) (nullable)
        
        Instance Methods
        dev.lone.itemsadder.api.CustomStack getSeed()
        List<ItemStack> getLoot(@Nullable ItemStack toolUsed) (nullable)
        List<ItemStack> getLoot() (nullable)
        int getAge()
        void setAge(int age)
        boolean isFullyGrown()
        int getMaxAge()
        void setFullyGrown()
        void incrementAge()
        
        
        CustomEntity class: dev.lone.itemsadder.api
        Here are all the methods in the CustomEntity class with their return types:
        Static Methods
        static Set<String> getNamespacedIdsInRegistry()
        static boolean isInRegistry(String namespacedId)
        static dev.lone.itemsadder.api.CustomEntity spawn(String namespacedId, Location location) (nullable)
        static dev.lone.itemsadder.api.CustomEntity spawn(String namespacedId, Location location, boolean frustumCulling) (nullable)
        static dev.lone.itemsadder.api.CustomEntity spawn(String namespacedId, Location location, List<Player> viewers, boolean frustumCulling, @Nullable Consumer<LivingEntity> function) (nullable)
        static dev.lone.itemsadder.api.CustomEntity spawn(String namespacedId, Location location, boolean frustumCulling, boolean noBase, boolean noHitbox) (nullable)
        static dev.lone.itemsadder.api.CustomEntity spawn(String namespacedId, Location location, List<Player> viewers, boolean frustumCulling, boolean noBase, boolean noHitbox, @Nullable Consumer<LivingEntity> function) (nullable)
        static dev.lone.itemsadder.api.CustomEntity convert(String namespacedId, LivingEntity bukkitEntity) (nullable)
        static dev.lone.itemsadder.api.CustomEntity convert(String namespacedId, LivingEntity bukkitEntity, boolean frustumCulling) (nullable)
        static dev.lone.itemsadder.api.CustomEntity convert(String namespacedId, LivingEntity bukkitEntity, boolean frustumCulling, boolean noHitbox, boolean canBaseEntityBeDestroyed, boolean hideBaseEntity) (nullable)
        static dev.lone.itemsadder.api.CustomEntity convert(String namespacedId, LivingEntity bukkitEntity, List<Player> viewers, boolean frustumCulling) (nullable)
        static dev.lone.itemsadder.api.CustomEntity byAlreadySpawned(Entity entity) (nullable)
        static boolean isCustomEntity(Entity entity)
        static boolean isCustomEntity(UUID uuid)
        static boolean hasAnimation(String entityNamespacedId, String animationName)
        static List<String> getAnimationsNames(String entityNamespacedId)
        static void removePassenger(LivingEntity passenger)
        static List<ItemStack> getLoot(LivingEntity bukkitEntity, @Nullable ItemStack tool)
        
        Instance Methods
        Entity getEntity()
        EntityType getType()
        Location getLocation()
        void teleport(Location location)
        String getNamespacedID()
        String getNamespace()
        String getId()
        void respawn(Player player)
        void addViewer(Player player)
        void removeViewer(Player player)
        void setFrustumCulling(boolean cull)
        boolean getFrustumCulling()
        boolean playAnimation(String name, @Nullable Runnable callback)
        boolean playAnimation(String name)
        void stopAnimation()
        boolean isPlayingAnimation(String name)
        boolean hasAnimation(String name)
        List<String> getAnimationsNames()
        void destroy()
        void playDamageEffect(boolean fire)
        void setColorAllBones(int color)
        void setEnchantedAllBones(boolean enchanted)
        boolean hasMountBones()
        boolean addPassenger(LivingEntity passenger)
        Set<LivingEntity> getPassengers()
        boolean hasPassenger(LivingEntity passenger)
        boolean hasPassenger()
        boolean setPassenger(LivingEntity passenger, int ordinal) (throws IllegalArgumentException, IndexOutOfBoundsException)
        Set<dev.lone.itemsadder.api.CustomEntity.Bone> getBones()
        Set<dev.lone.itemsadder.api.CustomEntity.MountBone> getMountBones()
        dev.lone.itemsadder.api.CustomEntity.Bone getBone(int index) (throws IndexOutOfBoundsException)
        dev.lone.itemsadder.api.CustomEntity.Bone getBone(String name) (nullable)
        dev.lone.itemsadder.api.CustomEntity.MountBone getMountBoneByPassenger(LivingEntity passenger) (nullable)
        List<ItemStack> getLoot()
        List<ItemStack> getLoot(@Nullable ItemStack tool)
        
        Bone Inner Class Methods
        String getName()
        int getOrdinal()
        int getId()
        Location getLocation()
        int getColor()
        void setColor(int color)
        boolean getEnchanted()
        void setEnchanted(boolean enchanted)
        
        MountBone Inner Class Methods (extends Bone)
        LivingEntity getPassenger() (nullable)
        boolean setPassenger(LivingEntity entity)
        void removePassenger()
        void setLocked(boolean locked)
        boolean isLocked()
        void setCanControl(boolean canControl)
        boolean canControl()
    
    
        CustomMob class: dev.lone.itemsadder.api
        Static Methods
        static dev.lone.itemsadder.api.CustomMob spawn(String namespacedId, Location location) (nullable, deprecated)
        static dev.lone.itemsadder.api.CustomMob byAlreadySpawned(Entity entity) (nullable, deprecated)
        
        Instance Methods
        Entity getEntity() (deprecated)
        EntityType getType() (deprecated)
        String getNamespacedID() (deprecated)
        String getNamespace() (deprecated)
        String getName() (deprecated)
        String getId() (deprecated)
        
        
        CustomPlayer class extends CustomEntity: dev.lone.itemsadder.api
        Static Methods
        static dev.lone.itemsadder.api.CustomPlayer spawn(String playerSkin, Location location)
        static dev.lone.itemsadder.api.CustomPlayer byAlreadySpawned(Entity entity) (nullable)
        static void playEmote(Player player, String emoteName)
        static void stopEmote(Player player)
        
        Instance Methods
        String getPlayerName()
        boolean playAnimation(String emoteName) (overrides parent method)
        void stopAnimation()
    `
};