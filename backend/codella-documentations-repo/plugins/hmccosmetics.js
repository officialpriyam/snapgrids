module.exports = {
    name: 'HMCCosmetics',
    description: 'Minecraft plugin that allows you to add cosmetics to your server.',
    pluginId: 'HMCCosmetics',
    mavenIntegration: `
        <repositories>
            <repository>
                <id>hmc-repo-releases</id>
                <name>HibiscusMC Repository</name>
                <url>https://repo.hibiscusmc.com/releases</url>
            </repository>
        </repositories>
        <dependencies>
            <dependency>
                <groupId>com.hibiscusmc</groupId>
                <artifactId>HMCCosmetics</artifactId>
                <version>2.7.8</version>
            </dependency>
        </dependencies>
    `,
    usage: `
        HMCCosmeticsAPI class: com.hibiscusmc.hmccosmetics.api (Main API class for HMCCosmetics)
        Static Methods
        
        static @Nullable Cosmetic getCosmetic(@NotNull String id) (Get cosmetic by ID - returns null if not found)
        static @Nullable CosmeticUser getUser(@NotNull UUID uuid) (Get cosmetic user by UUID - returns null if offline/unassociated)
        static @Nullable Menu getMenu(@NotNull String id) (Get menu by ID - returns null if not found)
        static void equipCosmetic(@NotNull CosmeticUser user, @NotNull Cosmetic cosmetic) (Equip cosmetic to user)
        static void equipCosmetic(@NotNull CosmeticUser user, @NotNull Cosmetic cosmetic, @Nullable Color color) (Equip cosmetic with color)
        static void unequipCosmetic(@NotNull CosmeticUser user, @NotNull CosmeticSlot slot) (Remove cosmetic from slot)
        static @NotNull List<Cosmetic> getAllCosmetics() (Get immutable list of all registered cosmetics)
        static @NotNull List<CosmeticUser> getAllCosmeticUsers() (Get immutable list of all registered users)
        static @NotNull Map<String, CosmeticSlot> getAllCosmeticSlots() (Get immutable map of all cosmetic slots)
        static @NotNull CosmeticSlot registerCosmeticSlot(@NotNull String id) (Register new cosmetic slot - call in onLoad())
        static void registerCosmeticUserProvider(@NotNull CosmeticUserProvider provider) (Register custom user provider - call in onLoad())
        static @NotNull CosmeticUserProvider getCosmeticUserProvider() (Get current user provider)
        static void registerCosmeticProvider(@NotNull CosmeticProvider provider) (Register custom cosmetic provider - call in onLoad())
        static @NotNull CosmeticProvider getCosmeticProvider() (Get current cosmetic provider)
        static @Nullable String getNMSVersion() (Get NMS version - null until setup complete)
        static @NotNull String getHMCCVersion() (Get HMCCosmetics version)
        
        Core Classes
        Cosmetic abstract class: com.hibiscusmc.hmccosmetics.cosmetic
        Fields
        
        protected static ItemStack UNDEFINED_DISPLAY_ITEM_STACK (Default barrier item for undefined displays)
        
        Constructors
        
        Cosmetic(@NotNull String id, @NotNull ConfigurationNode config)
        Cosmetic(String id, String permission, ItemStack item, String material, CosmeticSlot slot, boolean dyeable)
        
        Public Methods
        
        String getId() (Get identifier of the cosmetic)
        String getPermission() (Get permission to use the cosmetic)
        String getMaterial() (Get material string of the cosmetic)
        CosmeticSlot getSlot() (Get cosmetic slot this occupies)
        boolean isDyeable() (Check if cosmetic is dyeable)
        boolean requiresPermission() (Check if permission is required)
        void update(CosmeticUser user) (Request update on cosmetic)
        @Nullable ItemStack getItem() (Get cloned display ItemStack)
        
        Protected Methods
        
        void doUpdate(final CosmeticUser user) (Action performed on update - NO-OP by default)
        ItemStack generateItemStack(ConfigurationNode config) (Generate ItemStack from config)
        
        CosmeticUser class: com.hibiscusmc.hmccosmetics.user (implements CosmeticHolder)
        Constructors
        
        @Deprecated CosmeticUser(UUID uuid, UserData data) (Use CosmeticUser(UUID) and initialize(UserData))
        CosmeticUser(@NotNull UUID uuid)
        
        Public Methods
        
        UUID getUniqueId() (Get user's UUID)
        CosmeticUser initialize(final @Nullable UserData userData) (Initialize user with data)
        void startTicking() (Start user tick operations)
        void destroy() (Clean up user resources)
        @Nullable Player getPlayer() (Get associated player - may be null for NPCs)
        Entity getEntity() (Get associated entity)
        Color getCosmeticColor(CosmeticSlot slot) (Get cosmetic color for slot)
        List<CosmeticSlot> getDyeableSlots() (Get list of dyeable cosmetic slots)
        Set<CosmeticSlot> getSlotsWithCosmetics() (Get slots containing cosmetics)
        ItemStack getUserCosmeticItem(CosmeticSlot slot) (Get user's cosmetic item for slot)
        ItemStack getUserCosmeticItem(@NotNull Cosmetic cosmetic) (Get user's cosmetic item)
        ItemStack getUserCosmeticItem(@NotNull Cosmetic cosmetic, @Nullable ItemStack item) (Get processed cosmetic item)
        UserBalloonManager getBalloonManager() (Get balloon manager)
        UserBackpackManager getUserBackpackManager() (Get backpack manager)
        UserWardrobeManager getWardrobeManager() (Get wardrobe manager)
        void enterWardrobe(@NotNull Wardrobe wardrobe, boolean ignoreDistance) (Enter wardrobe)
        @Deprecated void enterWardrobe(boolean ignoreDistance, @NotNull Wardrobe wardrobe) (Use enterWardrobe(Wardrobe, boolean))
        void leaveWardrobe(boolean ejected) (Leave wardrobe)
        @Deprecated void leaveWardrobe() (Use leaveWardrobe(boolean))
        boolean isInWardrobe() (Check if in wardrobe)
        void spawnBackpack(CosmeticBackpackType cosmeticBackpackType) (Spawn backpack)
        void despawnBackpack() (Despawn backpack)
        boolean isBackpackSpawned() (Check if backpack is spawned)
        void spawnBalloon(CosmeticBalloonType cosmeticBalloonType) (Spawn balloon)
        void despawnBalloon() (Despawn balloon)
        boolean isBalloonSpawned() (Check if balloon is spawned)
        void respawnBackpack() (Respawn backpack)
        void respawnBalloon() (Respawn balloon)
        void removeArmor(CosmeticSlot slot) (Remove armor from slot)
        void hidePlayer() (Hide player from all other players)
        void showPlayer() (Show player to all other players)
        void hideCosmetics(HiddenReason reason) (Hide cosmetics for reason)
        void silentlyAddHideFlag(HiddenReason reason) (Silently add hidden flag)
        void showCosmetics(HiddenReason reason) (Show cosmetics - remove reason)
        @Deprecated boolean getHidden() (Use isHidden())
        boolean isHidden() (Check if cosmetics are hidden)
        boolean isHidden(HiddenReason reason) (Check if hidden for specific reason)
        List<HiddenReason> getHiddenReasons() (Get all hidden reasons)
        void clearHiddenReasons() (Clear all hidden reasons)
        
        Protected Methods
        
        boolean applyCosmetic(@NotNull Cosmetic cosmetic, @Nullable Color color) (Apply cosmetic during initialization)
        boolean canApplyCosmetic(@NotNull Cosmetic cosmetic) (Check if can apply cosmetic during initialization)
        void applyHiddenState(@NotNull List<HiddenReason> hiddenReasons) (Apply hidden state during initialization)
        void tick() (Tick operation for user)
        
        Deprecated Methods
        
        @Deprecated void addPlayerCosmetic(@NotNull Cosmetic cosmetic) (Use addCosmetic)
        @Deprecated void addPlayerCosmetic(@NotNull Cosmetic cosmetic, @Nullable Color color) (Use addCosmetic)
        
        Nested Enum - HiddenReason
        
        NONE, WORLDGUARD, PLUGIN, VANISH, POTION, ACTION, COMMAND, EMOTE, GAMEMODE, WORLD, DISABLED
        
        Cosmetics class: com.hibiscusmc.hmccosmetics.cosmetic (Manager for cosmetics)
        Static Methods
        
        static void addCosmetic(Cosmetic cosmetic) (Add cosmetic to registry)
        static void removeCosmetic(String id) (Remove cosmetic by ID)
        static void removeCosmetic(Cosmetic cosmetic) (Remove cosmetic by object)
        static @Nullable Cosmetic getCosmetic(String id) (Get cosmetic by ID)
        static @NotNull Set<Cosmetic> values() (Get all cosmetic values)
        static @NotNull Set<String> keys() (Get all cosmetic keys)
        static boolean hasCosmetic(String id) (Check if cosmetic exists by ID)
        static boolean hasCosmetic(Cosmetic cosmetic) (Check if cosmetic exists by object)
        static void setup() (Setup and load cosmetics from files)
        static void registerProvider(final CosmeticProvider provider) (Register custom provider)
        static CosmeticProvider getProvider() (Get current provider)
        
        CosmeticUsers class: com.hibiscusmc.hmccosmetics.user (Manager for cosmetic users)
        Static Methods
        
        static void addUser(@NotNull CosmeticUser user) (Add user to registry - won't override existing)
        static void removeUser(UUID uuid) (Remove user by UUID)
        static void removeUser(@NotNull CosmeticUser user) (Remove user by object)
        static @Nullable CosmeticUser getUser(UUID uuid) (Get user by UUID)
        static @Nullable CosmeticUser getUser(@NotNull Player player) (Get user by player)
        static @Nullable CosmeticUser getUser(int entityId) (Get user by entity ID)
        static void registerProvider(final CosmeticUserProvider provider) (Register custom provider)
        static CosmeticUserProvider getProvider() (Get current provider)
        static @NotNull Set<CosmeticUser> values() (Get all users)
        
        Provider Interfaces
        CosmeticHolder interface: com.hibiscusmc.hmccosmetics.cosmetic (Interface for objects that can wear cosmetics)
        Interface Methods
        
        @Nullable Cosmetic getCosmetic(@NotNull CosmeticSlot slot) (Get cosmetic in slot)
        @NotNull ImmutableCollection<Cosmetic> getCosmetics() (Get all cosmetics)
        void addCosmetic(@NotNull Cosmetic cosmetic, @Nullable Color color) (Add cosmetic with color)
        void addCosmetic(@NotNull Cosmetic cosmetic) (Add cosmetic without color - default method)
        void removeCosmetics() (Remove all cosmetics - default method)
        void removeCosmeticSlot(@NotNull CosmeticSlot slot) (Remove cosmetic from slot)
        void removeCosmeticSlot(@NotNull Cosmetic cosmetic) (Remove specific cosmetic - default method)
        boolean hasCosmeticInSlot(@NotNull CosmeticSlot slot) (Check if slot has cosmetic - default method)
        boolean hasCosmeticInSlot(@NotNull Cosmetic cosmetic) (Check if specific cosmetic equipped - default method)
        boolean canEquipCosmetic(@NotNull Cosmetic cosmetic) (Check if can equip cosmetic - default method)
        boolean canEquipCosmetic(@NotNull Cosmetic cosmetic, boolean ignoreWardrobe) (Check if can equip with wardrobe option)
        void updateCosmetic(@NotNull CosmeticSlot slot) (Update cosmetic in slot)
        
        Static Methods
        
        static @NotNull CosmeticUser ensureSingleCosmeticUser(@NotNull Player viewer, @NotNull CosmeticHolder cosmeticHolder) (Internal backwards compatibility method)
        
        CosmeticProvider abstract class: com.hibiscusmc.hmccosmetics.cosmetic (Provider for creating cosmetics)
        Protected Fields
        
        static final Map<CosmeticSlot, BiFunction<String, ConfigurationNode, Cosmetic>> MAPPINGS (Slot to cosmetic type mappings)
        
        Abstract Methods
        
        abstract Plugin getProviderPlugin() (Get plugin providing this provider)
        
        Public Methods
        
        @NotNull Cosmetic createCosmetic(String id, ConfigurationNode config, CosmeticSlot slot) (Create cosmetic from config)
        
        Nested Class - Default
        
        static final CosmeticProvider INSTANCE (Default provider instance)
        
        CosmeticUserProvider abstract class: com.hibiscusmc.hmccosmetics.user (Provider for creating cosmetic users)
        Abstract Methods
        
        abstract @NotNull CosmeticUser createCosmeticUser(@NotNull UUID playerId) (Create custom user - called during PlayerJoinEvent)
        abstract Plugin getProviderPlugin() (Get plugin providing this provider)
        
        Nested Class - Default
        
        static CosmeticUserProvider INSTANCE (Default provider instance)
        @NotNull CosmeticUser createCosmeticUser(@NotNull UUID playerId) (overrides) (Create default user)
        Plugin getProviderPlugin() (overrides) (Return HMCCosmetics plugin)
    `
};