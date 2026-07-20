module.exports = {
    name: 'ExcellentCrates',
    description: 'Crates plugin for Minecraft.',
    pluginId: 'ExcellentCrates',
    mavenIntegration: `
        <repositories>
            <repository>
              <id>nightexpress-releases</id>
              <url>https://repo.nightexpressdev.com/releases</url>
            </repository>
        </repositories>
        <dependencies>
            <dependency>
              <groupId>su.nightexpress.excellentcrates</groupId>
              <artifactId>ExcellentCrates</artifactId>
              <version>6.2.1</version>
              <scope>provided</scope>
            </dependency>
        </dependencies>
    `,
    usage: `
    CratesAPI class: su.nightexpress.excellentcrates
    Static Methods
    static void load(@NotNull CratesPlugin instance) (package-private)
    static void clear() (package-private)
    static @NotNull CratesPlugin getPlugin()
    static @NotNull CrateUser getUserData(@NotNull Player player)
    static @NotNull UserManager getUserManager()
    static @NotNull CrateManager getCrateManager()
    static @NotNull KeyManager getKeyManager()
    static void info(@NotNull String msg)
    static void warn(@NotNull String msg)
    static void error(@NotNull String msg)
    
    CrateManager class: su.nightexpress.excellentcrates.crate
    Extends: AbstractManager<CratesPlugin>
    
    Constructor
    CrateManager(@NotNull CratesPlugin plugin)
    
    Protected Methods
    void onLoad()
    void onShutdown()
    
    Private Methods
    void updateHologramTemplates()
    void loadRarities()
    void loadPreviews()
    void loadUI()
    void loadCrates()
    void loadCrate(@NotNull Crate crate)
    void runInspections()
    
    Public Methods
    @NotNull Map<String, Rarity> getRarityByIdMap()
    @NotNull Set<Rarity> getRarities()
    @Nullable Rarity getRarity(@NotNull String id)
    @NotNull Set<String> getRarityIds()
    @NotNull Rarity getMostCommonRarity()
    @NotNull Map<String, PreviewMenu> getPreviewByIdMap()
    @Nullable PreviewMenu getPreviewById(@NotNull String id)
    @NotNull Set<PreviewMenu> getPreviews()
    @NotNull List<String> getPreviewNames()
    void openMilestones(@NotNull Player player, @NotNull CrateSource source)
    @NotNull List<String> getCrateIds()
    @NotNull Map<String, Crate> getCratesMap()
    @NotNull Set<Crate> getCrates()
    boolean isCrate(@NotNull ItemStack item)
    @Nullable Crate getCrateById(@NotNull String id)
    @Nullable Crate getCrateByItem(@NotNull ItemStack item)
    @Nullable Crate getCrateByBlock(@NotNull Block block)
    @Nullable Crate getCrateByLocation(@NotNull Location location)
    void removeCratePositions(@NotNull Crate crate)
    void addCratePositions(@NotNull Crate crate)
    boolean create(@NotNull String id)
    boolean delete(@NotNull Crate crate)
    boolean dropCrateItem(@NotNull Crate crate, @NotNull Location location)
    void giveCrateItem(@NotNull Player player, @NotNull Crate crate, int amount)
    void previewCrate(@NotNull Player player, @NotNull CrateSource source)
    void interactCrate(@NotNull Player player, @NotNull Crate crate, @NotNull InteractType action, @Nullable ItemStack item, @Nullable Block block)
    boolean openCrate(@NotNull Player player, @NotNull CrateSource source, @NotNull OpenSettings settings)
    boolean triggerMilestones(@NotNull Player player, @NotNull Crate crate, int progress)
    void giveReward(@NotNull Player player, @NotNull Reward reward)
    int getGlobalRollsLeft(@NotNull Reward reward)
    int getPersonalRollsLeft(@NotNull Reward reward, @NotNull Player player)
    int getAvailableRolls(@NotNull Player player, @NotNull Reward reward)
    void addRollCount(@NotNull Player player, @NotNull Reward reward)
    void setPreviewCooldown(@NotNull Player player)
    long getPreviewCooldown(@NotNull Player player)
    boolean hasPreviewCooldown(@NotNull Player player)
    void removePreviewCooldown(@NotNull Player player)
    void playCrateEffects()
    
    Crate class: su.nightexpress.excellentcrates.crate.impl
    Extends: AbstractFileData<CratesPlugin>
    
    Constructor
    Crate(@NotNull CratesPlugin plugin, @NotNull File file)
    
    Protected Methods
    boolean onLoad(@NotNull FileConfig config)
    void onSave(@NotNull FileConfig config)
    
    Private Methods
    void writeSettings(@NotNull FileConfig config)
    void writeRewards(@NotNull FileConfig config)
    void writeReward(@NotNull FileConfig config, @NotNull Reward reward)
    void writeMilestones(@NotNull FileConfig config)
    void writeConfig(@NotNull Consumer<FileConfig> consumer)
    void manageHologram(@NotNull Consumer<HologramManager> consumer)
    @NotNull Reward rollReward(@NotNull Collection<Reward> allRewards)
    
    Public Methods
    void saveSettings()
    void saveRewards()
    void saveReward(@NotNull Reward reward)
    void saveMilestones()
    @NotNull UnaryOperator<String> replacePlaceholders()
    @NotNull UnaryOperator<String> replaceAllPlaceholders()
    @Nullable GlobalCrateData getData()
    @Nullable String getLatestOpener()
    @Nullable String getLastOpenerName()
    @Nullable String getLatestReward()
    @Nullable String getLastRewardName()
    void createHologram()
    void removeHologram()
    void recreateHologram()
    boolean hasRewards()
    boolean hasMilestones()
    @NotNull Set<CrateKey> getRequiredKeys()
    boolean isGoodKey(@NotNull CrateKey key)
    boolean isAllPhysicalKeys()
    boolean isAllVirtualKeys()
    boolean isPreviewValid()
    boolean isAnimationValid()
    boolean isHologramTemplateValid()
    boolean isEffectEnabled()
    @NotNull CrateEffect getEffect()
    boolean hasOpenCost()
    boolean hasOpenCooldown()
    boolean hasPermission(@NotNull Player player)
    boolean hasCostBypassPermisssion(@NotNull Player player)
    boolean hasCooldownBypassPermission(@NotNull Player player)
    boolean canAffordOpen(@NotNull Player player)
    void payForOpen(@NotNull Player player)
    void refundForOpen(@NotNull Player player)
    @NotNull String getPermission()
    @NotNull String getCostBypassPermission()
    @NotNull List<String> getHologramText()
    boolean hasRewards(@NotNull Player player)
    boolean hasRewards(@NotNull Rarity rarity)
    boolean hasRewards(@Nullable Player player, @Nullable Rarity rarity)
    @NotNull Reward rollReward()
    @NotNull Reward rollReward(@NotNull Rarity rarity)
    @NotNull Reward rollReward(@NotNull Player player)
    @NotNull Reward rollReward(@Nullable Player player, @Nullable Rarity rarity)
    void addBlockPosition(@NotNull Location location)
    void clearBlockPositions()
    @NotNull String getName()
    @NotNull String getNameTranslated()
    void setName(@NotNull String name)
    @NotNull List<String> getDescription()
    void setDescription(@NotNull List<String> description)
    @NotNull ItemProvider getItemProvider()
    void setItemProvider(@NotNull ItemProvider itemProvider)
    @NotNull ItemStack getRawItem()
    @NotNull ItemStack getItem()
    boolean isItemStackable()
    void setItemStackable(boolean itemStackable)
    @NotNull String getPreviewId()
    void setPreviewId(@NotNull String previewId)
    boolean isPreviewEnabled()
    void setPreviewEnabled(boolean previewEnabled)
    @NotNull String getAnimationId()
    void setAnimationId(@NotNull String animationId)
    boolean isAnimationEnabled()
    void setAnimationEnabled(boolean animationEnabled)
    boolean isPermissionRequired()
    void setPermissionRequired(boolean isPermissionRequired)
    int getOpenCooldown()
    void setOpenCooldown(int openCooldown)
    @NotNull Map<String, Cost> getOpenCostMap()
    @NotNull Set<Cost> getOpenCosts()
    @Nullable Cost getOpenCost(@NotNull String currency)
    void addOpenCost(@NotNull Cost cost)
    void removeOpenCost(@NotNull Cost cost)
    boolean isKeyRequired()
    void setKeyRequired(boolean keyRequired)
    @NotNull Set<String> getKeyIds()
    boolean addKeyId(@NotNull String keyId)
    boolean removeKeyId(@NotNull String keyId)
    void setKeyIds(@NotNull Set<String> keyIds)
    boolean isPushbackEnabled()
    void setPushbackEnabled(boolean blockPushback)
    @NotNull Set<WorldPos> getBlockPositions()
    boolean isHologramEnabled()
    void setHologramEnabled(boolean hologramEnabled)
    @NotNull String getHologramTemplateId()
    void setHologramTemplateId(@NotNull String hologramTemplateId)
    double getHologramYOffset()
    void setHologramYOffset(double hologramYOffset)
    @NotNull String getEffectType()
    void setEffectType(@NotNull String effectType)
    @NotNull UniParticle getEffectParticle()
    void setEffectParticle(@NotNull UniParticle wrapped)
    @NotNull LinkedHashMap<String, Reward> getRewardsMap()
    @NotNull Set<Rarity> getRarities()
    @NotNull Set<String> getRewardIds()
    @NotNull Set<Reward> getRewards()
    @NotNull List<Reward> getRewards(@NotNull Rarity rarity)
    @NotNull List<Reward> getRewards(@NotNull Player player)
    @NotNull List<Reward> getRewards(@Nullable Player player, @Nullable Rarity rarity)
    void setRewards(@NotNull List<Reward> rewards)
    @Nullable Reward getReward(@NotNull String id)
    @Nullable Reward getMilestoneReward(int openings)
    void addReward(@NotNull Reward reward)
    void removeReward(@NotNull Reward reward)
    void removeReward(@NotNull String id)
    @NotNull Set<Milestone> getMilestones()
    @Nullable Milestone getMilestone(int openings)
    boolean isMilestonesRepeatable()
    void setMilestonesRepeatable(boolean milestonesRepeatable)
    int getMaxMilestone()
    @Nullable Milestone getNextMilestone(int openings)
    
    Reward interface: su.nightexpress.excellentcrates.api.crate
    Extends: Writeable
    
    Abstract Methods
    void save()
    @NotNull UnaryOperator<String> replacePlaceholders()
    @NotNull UnaryOperator<String> replaceAllPlaceholders()
    void load(@NotNull FileConfig config, @NotNull String path)
    @NotNull RewardType getType()
    boolean hasProblems()
    boolean hasContent()
    int getAvailableRolls(@NotNull Player player)
    boolean hasGlobalLimit()
    boolean hasPersonalLimit()
    boolean isRollable()
    boolean hasBadPermissions(@NotNull Player player)
    boolean hasRequiredPermissions(@NotNull Player player)
    boolean fitRequirements(@NotNull Player player)
    boolean canWin(@NotNull Player player)
    void giveContent(@NotNull Player player)
    void give(@NotNull Player player)
    double getRollChance()
    @NotNull String getId()
    @NotNull Crate getCrate()
    @NotNull String getName()
    @NotNull String getNameTranslated()
    @NotNull List<String> getDescription()
    @NotNull List<String> getDescriptionTranslated()
    double getWeight()
    void setWeight(double weight)
    @NotNull Rarity getRarity()
    void setRarity(@NotNull Rarity rarity)
    boolean isBroadcast()
    void setBroadcast(boolean broadcast)
    void setPlaceholderApply(boolean placeholderApply)
    boolean isPlaceholderApply()
    boolean isOneTimed()
    @NotNull LimitValues getPlayerLimits()
    void setPlayerLimits(@NotNull LimitValues limits)
    @NotNull LimitValues getGlobalLimits()
    void setGlobalLimits(@NotNull LimitValues limits)
    @NotNull ItemStack getPreviewItem()
    @NotNull ItemProvider getPreview()
    void setPreview(@NotNull ItemProvider provider)
    @NotNull Set<String> getIgnoredPermissions()
    void setIgnoredPermissions(@NotNull Set<String> permissions)
    @NotNull Set<String> getRequiredPermissions()
    void setRequiredPermissions(@NotNull Set<String> permissions)
    
    AbstractReward class: su.nightexpress.excellentcrates.crate.reward
    Implements: Reward
    
    Constructor
    AbstractReward(@NotNull CratesPlugin plugin, @NotNull Crate crate, @NotNull String id, @NotNull Rarity rarity)
    
    Public Methods
    void load(@NotNull FileConfig config, @NotNull String path)
    void write(@NotNull FileConfig config, @NotNull String path)
    void save()
    @NotNull UnaryOperator<String> replacePlaceholders()
    boolean hasProblems()
    boolean hasGlobalLimit()
    boolean hasPersonalLimit()
    int getAvailableRolls(@NotNull Player player)
    boolean isRollable()
    boolean hasBadPermissions(@NotNull Player player)
    boolean hasRequiredPermissions(@NotNull Player player)
    boolean fitRequirements(@NotNull Player player)
    boolean canWin(@NotNull Player player)
    void give(@NotNull Player player)
    double getRollChance()
    @NotNull String getId()
    @NotNull Crate getCrate()
    @NotNull String getNameTranslated()
    @NotNull List<String> getDescriptionTranslated()
    double getWeight()
    void setWeight(double weight)
    @NotNull ItemProvider getPreview()
    void setPreview(@NotNull ItemProvider provider)
    @NotNull Rarity getRarity()
    void setRarity(@NotNull Rarity rarity)
    boolean isBroadcast()
    void setBroadcast(boolean broadcast)
    void setPlaceholderApply(boolean placeholderApply)
    boolean isPlaceholderApply()
    boolean isOneTimed()
    @NotNull LimitValues getPlayerLimits()
    void setPlayerLimits(@NotNull LimitValues playerLimits)
    @NotNull LimitValues getGlobalLimits()
    void setGlobalLimits(@NotNull LimitValues globalLimits)
    @NotNull Set<String> getIgnoredPermissions()
    void setIgnoredPermissions(@NotNull Set<String> ignoredPermissions)
    @NotNull Set<String> getRequiredPermissions()
    void setRequiredPermissions(@NotNull Set<String> requiredPermissions)
    
    Protected Methods
    abstract void loadAdditional(@NotNull FileConfig config, @NotNull String path)
    abstract void writeAdditional(@NotNull FileConfig config, @NotNull String path)
    @NotNull Replacer createContentReplacer(@NotNull Player player)
    
    ItemReward class: su.nightexpress.excellentcrates.crate.reward.impl
    Extends: AbstractReward
    
    Constructor
    ItemReward(@NotNull CratesPlugin plugin, @NotNull Crate crate, @NotNull String id, @NotNull Rarity rarity)
    
    Protected Methods
    void loadAdditional(@NotNull FileConfig config, @NotNull String path)
    void writeAdditional(@NotNull FileConfig config, @NotNull String path)
    
    Public Methods
    @NotNull UnaryOperator<String> replaceAllPlaceholders()
    @NotNull RewardType getType()
    boolean hasContent()
    boolean hasInvalidItems()
    void giveContent(@NotNull Player player)
    boolean isCustomPreview()
    void setCustomPreview(boolean customPreview)
    @NotNull String getName()
    @NotNull List<String> getDescription()
    @NotNull ItemStack getPreviewItem()
    @NotNull ItemProvider getPreview()
    @NotNull List<ItemProvider> getItems()
    void setItems(@NotNull List<ItemProvider> items)
    void addItem(@NotNull ItemProvider provider)
    
    CommandReward class: su.nightexpress.excellentcrates.crate.reward.impl
    Extends: AbstractReward
    
    Constructor
    CommandReward(@NotNull CratesPlugin plugin, @NotNull Crate crate, @NotNull String id, @NotNull Rarity rarity)
    
    Protected Methods
    void loadAdditional(@NotNull FileConfig config, @NotNull String path)
    void writeAdditional(@NotNull FileConfig config, @NotNull String path)
    
    Public Methods
    @NotNull UnaryOperator<String> replaceAllPlaceholders()
    @NotNull RewardType getType()
    boolean hasContent()
    void giveContent(@NotNull Player player)
    @NotNull ItemStack getPreviewItem()
    @NotNull String getName()
    void setName(@NotNull String name)
    @NotNull List<String> getDescription()
    void setDescription(@NotNull List<String> description)
    @NotNull List<String> getCommands()
    void setCommands(@NotNull List<String> commands)
    
    RewardFactory class: su.nightexpress.excellentcrates.crate.reward
    
    Static Methods
    static @NotNull Reward read(@NotNull CratesPlugin plugin, @NotNull Crate crate, @NotNull String id, @NotNull FileConfig config, @NotNull String path)
    static @NotNull Reward wizardCreation(@NotNull CratesPlugin plugin, @NotNull Crate crate, @NotNull ItemStack source, @NotNull RewardType type, @NotNull ItemProvider provider)
    static @NotNull Reward create(@NotNull CratesPlugin plugin, @NotNull Crate crate, @NotNull String id, @NotNull Rarity rarity, @NotNull RewardType type)
    
    KeyManager class: su.nightexpress.excellentcrates.key
    Extends: AbstractManager<CratesPlugin>
    
    Constructor
    KeyManager(@NotNull CratesPlugin plugin)
    
    Protected Methods
    void onLoad()
    void onShutdown()
    
    Private Methods
    void loadKeys()
    void loadKey(@NotNull CrateKey crateKey)
    void runInspections()
    @NotNull Predicate<ItemStack> getItemStackPredicate(@NotNull CrateKey key)
    
    Public Methods
    boolean create(@NotNull String id)
    boolean delete(@NotNull CrateKey key)
    boolean dropKeyItem(@NotNull CrateKey key, @NotNull Location location)
    @NotNull Map<String, CrateKey> getKeyByIdMap()
    @NotNull Set<CrateKey> getKeys()
    @NotNull List<String> getKeyIds()
    @Nullable CrateKey getKeyById(@NotNull String id)
    @Nullable CrateKey getKeyByItem(@NotNull ItemStack item)
    @NotNull Set<CrateKey> getKeys(@NotNull Player player, @NotNull Crate crate)
    @Nullable ItemStack getFirstKeyStack(@NotNull Player player, @NotNull CrateKey key)
    @Nullable CrateKey getOpenKey(@NotNull Player player, @NotNull Crate crate)
    boolean isKey(@NotNull ItemStack item)
    boolean isKey(@NotNull ItemStack item, @NotNull CrateKey key)
    boolean isKey(@NotNull ItemStack item, @NotNull Crate crate)
    int getKeysAmount(@NotNull Player player, @NotNull Crate crate)
    int getKeysAmount(@NotNull Player player, @NotNull CrateKey key)
    boolean hasKey(@NotNull Player player, @NotNull Crate crate)
    boolean hasKey(@NotNull Player player, @NotNull CrateKey key)
    void giveKeysOnHold(@NotNull Player player)
    void setKey(@NotNull CrateUser user, @NotNull CrateKey key, int amount)
    void setKey(@NotNull Player player, @NotNull CrateKey key, int amount)
    void giveKey(@NotNull CrateUser user, @NotNull CrateKey key, int amount)
    void giveKey(@NotNull Player player, @NotNull CrateKey key, int amount)
    @Nullable CrateKey takeKey(@NotNull Player player, @NotNull Crate crate)
    void takeKey(@NotNull CrateUser user, @NotNull CrateKey key, int amount)
    void takeKey(@NotNull Player player, @NotNull CrateKey key, int amount)
    
    CrateKey class: su.nightexpress.excellentcrates.key
    Extends: AbstractFileData<CratesPlugin>
    
    Constructor
    CrateKey(@NotNull CratesPlugin plugin, @NotNull File file)
    
    Protected Methods
    boolean onLoad(@NotNull FileConfig config)
    void onSave(@NotNull FileConfig config)
    
    Public Methods
    @NotNull UnaryOperator<String> replacePlaceholders()
    @NotNull String getName()
    @NotNull String getNameTranslated()
    void setName(@NotNull String name)
    boolean isVirtual()
    void setVirtual(boolean virtual)
    @NotNull ItemStack getRawItem()
    @NotNull ItemStack getItem()
    boolean isItemStackable()
    void setItemStackable(boolean itemStackable)
    @NotNull ItemProvider getProvider()
    void setProvider(@NotNull ItemProvider provider)
    
    UserManager class: su.nightexpress.excellentcrates.user
    Extends: AbstractUserManager<CratesPlugin, CrateUser>
    
    Constructor
    UserManager(@NotNull CratesPlugin plugin, @NotNull DataHandler dataHandler)
    
    Public Methods
    @NotNull CrateUser create(@NotNull UUID uuid, @NotNull String name)
    
    CrateUser class: su.nightexpress.excellentcrates.user
    Extends: AbstractUser
    
    Constructors
    CrateUser(@NotNull UUID uuid, @NotNull String name)
    CrateUser(@NotNull UUID uuid, @NotNull String name, long dateCreated, long lastOnline, @NotNull Map<String, Integer> keys, @NotNull Map<String, Integer> keysOnHold, @NotNull Map<String, UserCrateData> crateDataMap)
    
    Public Methods
    @NotNull Map<String, UserCrateData> getCrateDataMap()
    @NotNull UserCrateData getCrateData(@NotNull Crate crate)
    @NotNull UserCrateData getCrateData(@NotNull String id)
    @NotNull Map<String, Integer> getKeysMap()
    @NotNull Map<String, Integer> getKeysOnHold()
    void addKeys(@NotNull String id, int amount)
    void takeKeys(@NotNull String id, int amount)
    void setKeys(@NotNull String id, int amount)
    @Deprecated int getKeys(@NotNull String id)
    boolean hasKeys(@NotNull CrateKey key)
    boolean hasKeys(@NotNull String id)
    int countKeys(@NotNull CrateKey key)
    int countKeys(@NotNull String id)
    void addKeysOnHold(@NotNull String id, int amount)
    int getKeysOnHold(@NotNull String id)
    void cleanKeysOnHold()
    
    Opening interface: su.nightexpress.excellentcrates.api.opening
    
    Abstract Methods
    @Deprecated default void run()
    void start()
    void stop()
    void tick()
    boolean isCompleted()
    long getInterval()
    long getTickCount()
    boolean isTickTime()
    boolean isRunning()
    @NotNull Player getPlayer()
    @NotNull CrateSource getSource()
    @NotNull Crate getCrate()
    @Nullable CrateKey getKey()
    void instaRoll()
    boolean isRefundable()
    void setRefundable(boolean refundable)
    
    AbstractOpening class: su.nightexpress.excellentcrates.opening
    Implements: Opening
    
    Constructor
    AbstractOpening(@NotNull CratesPlugin plugin, @NotNull Player player, @NotNull CrateSource source, @Nullable CrateKey key)
    
    Public Methods
    void start()
    void stop()
    void tick()
    boolean isRunning()
    long getTickCount()
    boolean isTickTime()
    boolean isRefundable()
    void setRefundable(boolean refundable)
    @NotNull Player getPlayer()
    @NotNull CrateSource getSource()
    @NotNull Crate getCrate()
    @Nullable CrateKey getKey()
    
    Protected Methods
    abstract void onStart()
    abstract void onTick()
    abstract void onComplete()
    void onStop()
    
    OpeningProvider interface: su.nightexpress.excellentcrates.api.opening
    
    Abstract Methods
    void load(@NotNull FileConfig config)
    @NotNull String getId()
    @NotNull Opening createOpening(@NotNull Player player, @NotNull CrateSource source, @Nullable CrateKey key)
    
    OpeningUtils class: su.nightexpress.excellentcrates.opening
    
    Static Methods
    static @Nullable Firework createFirework(@NotNull Location location)
    static @NotNull SimpleRollProvider createSimpleRoll(@NotNull CratesPlugin plugin, @NotNull String id)
    static @NotNull SelectableProvider createSelectableSingle(@NotNull CratesPlugin plugin, @NotNull String id)
    static @NotNull SelectableProvider createSelectableTriple(@NotNull CratesPlugin plugin, @NotNull String id)
    static @NotNull InventoryProvider setupCSGO(@NotNull CratesPlugin plugin, @NotNull String id)
    static @NotNull InventoryProvider setupMystery(@NotNull CratesPlugin plugin, @NotNull String id)
    static @NotNull InventoryProvider setupRoulette(@NotNull CratesPlugin plugin, @NotNull String id)
    static @NotNull InventoryProvider setupEnclosing(@NotNull CratesPlugin plugin, @NotNull String id)
    static @NotNull InventoryProvider setupStorm(@NotNull CratesPlugin plugin, @NotNull String id)
    
    Private Static Methods
    static @NotNull SelectableProvider setupSelectableProvider(@NotNull CratesPlugin plugin, @NotNull String id, @NotNull Consumer<SelectableProvider> consumer)
    static @NotNull InventoryProvider setupInventoryProvider(@NotNull CratesPlugin plugin, @NotNull String id, @NotNull Consumer<InventoryProvider> consumer)
    static @NotNull Map<String, WeightedItem<NightItem>> getRainbowPanes()
    static @NotNull WeightedItem<NightItem> getWeighted(@NotNull Material material, double weight)
    
    Rarity class: su.nightexpress.excellentcrates.crate.impl
    
    Constructor
    Rarity(@NotNull CratesPlugin plugin, @NotNull String id, @NotNull String name, double weight)
    
    Static Methods
    static @NotNull Rarity read(@NotNull CratesPlugin plugin, @NotNull FileConfig config, @NotNull String path, @NotNull String id)
    
    Public Methods
    void write(@NotNull FileConfig config, @NotNull String path)
    @NotNull UnaryOperator<String> replacePlaceholders()
    double getRollChance()
    double getRollChance(@NotNull Crate crate)
    double getRollChance(@NotNull Collection<Rarity> rarities)
    @NotNull String getId()
    @NotNull String getName()
    @NotNull String getNameTranslated()
    void setName(@NotNull String name)
    double getWeight()
    void setWeight(double weight)
    
    Milestone class: su.nightexpress.excellentcrates.crate.impl
    
    Constructor
    Milestone(@NotNull Crate crate, @NotNull String rewardId, int openings)
    
    Static Methods
    static @NotNull Milestone read(@NotNull Crate crate, @NotNull FileConfig config, @NotNull String path)
    
    Public Methods
    void write(@NotNull FileConfig config, @NotNull String path)
    @NotNull UnaryOperator<String> replacePlaceholders()
    @Nullable Reward getReward()
    @NotNull Crate getCrate()
    @NotNull String getRewardId()
    void setRewardId(@NotNull String rewardId)
    int getOpenings()
    void setOpenings(int openings)
    
    CrateSource class: su.nightexpress.excellentcrates.crate.impl
    
    Constructors
    CrateSource(@NotNull Crate crate)
    CrateSource(@NotNull Crate crate, @Nullable ItemStack item, @Nullable Block block)
    CrateSource(@NotNull Crate crate, @Nullable ItemStack item, @Nullable WorldPos blockPos)
    
    Public Methods
    boolean hasItem()
    boolean hasBlock()
    @NotNull Crate getCrate()
    @Nullable ItemStack getItem()
    @Nullable WorldPos getBlockPos()
    @Nullable Block getBlock()
    String toString()
    
    OpenSettings class: su.nightexpress.excellentcrates.crate.impl
    
    Constructor
    OpenSettings()
    
    Public Methods
    boolean isForce()
    @NotNull OpenSettings setForce(boolean force)
    boolean isSkipAnimation()
    @NotNull OpenSettings setSkipAnimation(boolean skipAnimation)
    
    Cost class: su.nightexpress.excellentcrates.crate.impl
    
    Constructor
    Cost(@NotNull String currencyId, double amount)
    
    Public Methods
    boolean isValid()
    boolean isVailidCurrency()
    boolean isValidAmount()
    @NotNull String format()
    boolean deposit(@NotNull Player player)
    boolean withdraw(@NotNull Player player)
    boolean hasEnough(@NotNull Player player)
    @NotNull String getCurrencyId()
    double getAmount()
    void setAmount(double amount)
    
    LimitValues class: su.nightexpress.excellentcrates.crate.limit
    
    Constants
    static final int NEVER_RESET = -1
    static final int MIDNIGHT_RESET = -2
    
    Constructor
    LimitValues(boolean enabled, int amount, long resetTime, int resetStep)
    
    Static Methods
    static @NotNull LimitValues unlimited()
    static @NotNull LimitValues read(@NotNull FileConfig config, @NotNull String path)
    
    Public Methods
    void write(@NotNull FileConfig config, @NotNull String path)
    @NotNull UnaryOperator<String> replacePlaceholders()
    boolean isMidnight()
    boolean isNeverReset()
    long generateResetTimestamp()
    boolean isResetStep(int amount)
    boolean isUnlimitedAmount()
    boolean isOneTimed()
    void setMidnightCooldown()
    boolean isEnabled()
    void setEnabled(boolean enabled)
    int getAmount()
    void setAmount(int amount)
    long getResetTime()
    void setResetTime(long resetTime)
    int getResetStep()
    void setResetStep(int resetStep)
    
    CrateEffect class: su.nightexpress.excellentcrates.crate.effect
    
    Constructor
    CrateEffect(long tickInterval, int maxSteps)
    
    Public Methods
    boolean isDummy()
    void complete()
    void addTickCount()
    void playStep(@NotNull Location location, @NotNull UniParticle particle, @NotNull Player player)
    abstract void onStepPlay(@NotNull Location origin, @NotNull UniParticle particle, int step, @NotNull Player player)
    long getTickInterval()
    int getMaxSteps()
    
    Static Methods
    static @NotNull Location getPointOnCircle(@NotNull Location location, boolean doCopy, double x, double z, double y)
    
    EffectRegistry class: su.nightexpress.excellentcrates.crate.effect
    
    Static Methods
    static void load()
    static void clear()
    static void register(@NotNull String name, @NotNull CrateEffect effect)
    static @NotNull Set<CrateEffect> getEffects()
    static @NotNull Set<String> getEffectNames()
    static @Nullable CrateEffect getEffectById(@NotNull String name)
    static @NotNull CrateEffect getEffectOrDummy(@NotNull String name)
    
    RewardType enum: su.nightexpress.excellentcrates.api.crate
    Values: ITEM, COMMAND
    
    ItemType enum: su.nightexpress.excellentcrates.api.item
    Values: VANILLA, CUSTOM
    
    ItemProvider interface: su.nightexpress.excellentcrates.api.item
    Extends: Writeable
    
    Abstract Methods
    boolean isDummy()
    boolean isValid()
    boolean canProduceItem()
    @NotNull String getItemType()
    @NotNull ItemStack getItemStack()
    @Nullable ItemStack createItemStack()
    @NotNull ItemType getType()
    
    CrateEvent class: su.nightexpress.excellentcrates.api.event
    Extends: Event
    
    Constructor
    CrateEvent(@NotNull Crate crate, @NotNull Player player)
    
    Public Methods
    @NotNull Crate getCrate()
    @NotNull Player getPlayer()
    
    CrateOpenEvent class: su.nightexpress.excellentcrates.api.event
    Extends: CrateEvent
    Implements: Cancellable
    
    Constructor
    CrateOpenEvent(@NotNull Crate crate, @NotNull Player player)
    
    Static Methods
    static @NotNull HandlerList getHandlerList()
    
    Public Methods
    @NotNull HandlerList getHandlers()
    boolean isCancelled()
    void setCancelled(boolean cancelled)
    
    CrateObtainRewardEvent class: su.nightexpress.excellentcrates.api.event
    Extends: CrateEvent
    
    Constructor
    CrateObtainRewardEvent(@NotNull Reward reward, @NotNull Player player)
    
    Static Methods
    static @NotNull HandlerList getHandlerList()
    
    Public Methods
    @NotNull HandlerList getHandlers()
    @NotNull Reward getReward()
    
    ProviderRegistry class: su.nightexpress.excellentcrates.opening
    
    Static Methods
    static void load()
    static void clear()
    static void registerLoader(@NotNull String directory, @NotNull ProviderSupplier supplier)
    static void registerProvider(@NotNull OpeningProvider provider)
    static @NotNull Set<ProviderLoader> getLoaders()
    static @NotNull Set<OpeningProvider> getProviders()
    
    ProviderLoader class: su.nightexpress.excellentcrates.api.opening
    
    Constructor
    ProviderLoader(@NotNull String directory, @NotNull ProviderSupplier supplier)
    
    Public Methods
    @NotNull String getDirectory()
    @NotNull ProviderSupplier getSupplier()
    
    ProviderSupplier interface: su.nightexpress.excellentcrates.api.opening
    
    Abstract Methods
    @NotNull OpeningProvider supply(@NotNull CratesPlugin plugin, @NotNull String id)
    
    Spinner interface: su.nightexpress.excellentcrates.api.opening
    
    Abstract Methods
    void start()
    void stop()
    void tick()
    void tickAll()
    boolean isRunning()
    boolean isCompleted()
    long getTickInterval()
    long getTickCount()
    boolean isSpinTime()
    @NotNull String getId()
    boolean isSilent()
    void setSilent(boolean silent)
    int getTotalSpins()
    long getStepCount()
    void setStepCount(long count)
    boolean hasSpin()
    
    AbstractProvider class: su.nightexpress.excellentcrates.opening
    Implements: OpeningProvider
    
    Constructor
    AbstractProvider(@NotNull CratesPlugin plugin, @NotNull String id)
    
    Public Methods
    @NotNull String getId()
    
    OpeningListener class: su.nightexpress.excellentcrates.opening
    Extends: AbstractListener<CratesPlugin>
    
    Constructor
    OpeningListener(@NotNull CratesPlugin plugin, @NotNull OpeningManager manager)
    
    Public Methods (Event Handlers)
    void onQuit(PlayerQuitEvent event) [@EventHandler(priority = EventPriority.NORMAL)]
    void onInvOpeningClick(InventoryClickEvent event) [@EventHandler(priority = EventPriority.NORMAL)]
    void onInvOpeningClose(InventoryCloseEvent event) [@EventHandler(priority = EventPriority.NORMAL)]
    void onInvOpeningOpen(InventoryOpenEvent event) [@EventHandler(priority = EventPriority.NORMAL)]
    
    EffectId class: su.nightexpress.excellentcrates.crate.effect
    
    Constants
    static final String NONE = "none"
    static final String HELIX = "helix"
    static final String SPIRAL = "spiral"
    static final String SPHERE = "sphere"
    static final String HEART = "heart"
    static final String PULSAR = "pulsar"
    static final String BEACON = "beacon"
    static final String TORNADO = "tornado"
    static final String VORTEX = "vortex"
    static final String SIMPLE = "simple"
    
    DummyEffect class: su.nightexpress.excellentcrates.crate.effect.impl
    Extends: CrateEffect
    
    Constructor
    DummyEffect()
    
    Public Methods
    boolean isDummy()
    void onStepPlay(@NotNull Location origin, @NotNull UniParticle particle, int step, @NotNull Player player)
    
    BeaconEffect class: su.nightexpress.excellentcrates.crate.effect.impl
    Extends: CrateEffect
    
    Constructor
    BeaconEffect()
    
    Public Methods
    void onStepPlay(@NotNull Location origin, @NotNull UniParticle particle, int step, @NotNull Player player)
    
    HeartEffect class: su.nightexpress.excellentcrates.crate.effect.impl
    Extends: CrateEffect
    
    Constructor
    HeartEffect()
    
    Public Methods
    void onStepPlay(@NotNull Location origin, @NotNull UniParticle particle, int step, @NotNull Player player)
    
    HelixEffect class: su.nightexpress.excellentcrates.crate.effect.impl
    Extends: CrateEffect
    
    Constructor
    HelixEffect()
    
    Public Methods
    void onStepPlay(@NotNull Location origin, @NotNull UniParticle particle, int step, @NotNull Player player)
    
    PulsarEffect class: su.nightexpress.excellentcrates.crate.effect.impl
    Extends: CrateEffect
    
    Constructor
    PulsarEffect()
    
    Public Methods
    void onStepPlay(@NotNull Location origin, @NotNull UniParticle particle, int step, @NotNull Player player)
    
    SimpleEffect class: su.nightexpress.excellentcrates.crate.effect.impl
    Extends: CrateEffect
    
    Constructor
    SimpleEffect()
    
    Public Methods
    void onStepPlay(@NotNull Location origin, @NotNull UniParticle particle, int step, @NotNull Player player)
    
    SphereEffect class: su.nightexpress.excellentcrates.crate.effect.impl
    Extends: CrateEffect
    
    Constants
    static final double DELTA_ANGLE = 0.3141592653589793
    static final int NUM_CIRCLES = 8
    static final int NUM_POINTS = 10
    
    Constructor
    SphereEffect()
    
    Static Methods
    static Point3D[] getCircleCoordinates(double radius, int circleIndex)
    
    Public Methods
    void onStepPlay(@NotNull Location origin, @NotNull UniParticle particle, int step, @NotNull Player player)
    
    SpiralEffect class: su.nightexpress.excellentcrates.crate.effect.impl
    Extends: CrateEffect
    
    Constants
    static final double RADIUS = 1.0
    static final double VERTICAL_SPACING = 0.1
    static final double START_ANGLE = 0.0
    static final double END_ANGLE = 18.84955592153876
    static final int NUM_POINTS = 50
    
    Constructor
    SpiralEffect()
    
    Public Methods
    void onStepPlay(@NotNull Location origin, @NotNull UniParticle particle, int step, @NotNull Player player)
    
    TornadoEffect class: su.nightexpress.excellentcrates.crate.effect.impl
    Extends: CrateEffect
    
    Constants
    static final double Y_OFFSET = 0.15
    static final float TORNADO_HEIGHT = 3.15F
    static final float MAX_TORNADO_RADIUS = 2.25F
    static final double DISTANCE = 0.375
    
    Constructor
    TornadoEffect()
    
    Public Methods
    void onStepPlay(@NotNull Location origin, @NotNull UniParticle particle, int step, @NotNull Player player)
    
    Private Methods
    List<Vector> createCircle(double vertical, double radius)
    
    VortexEffect class: su.nightexpress.excellentcrates.crate.effect.impl
    Extends: CrateEffect
    
    Constants
    static final int STRANDS = 2
    static final int PARTICLES = 34
    static final float RADIUS = 1.5F
    static final float CURVE = 2.0F
    static final double ROTATION = 0.7853981633974483
    
    Constructor
    VortexEffect()
    
    Public Methods
    void onStepPlay(@NotNull Location origin, @NotNull UniParticle particle, int step, @NotNull Player player)
    
    LimitType enum: su.nightexpress.excellentcrates.crate.limit
    @Deprecated
    Values: GLOBAL, PLAYER
    `
};