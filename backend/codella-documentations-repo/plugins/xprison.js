module.exports = {
    name: 'XPrison',
    description: 'X-Prison is a an ultimate solution for your prison server. This core contains everything that should be on each prison server.',
    pluginId: 'XPrison',
    mavenIntegration: `
        <repositories>
            <repository>
                <id>jitpack.io</id>
                <url>https://jitpack.io</url>
            </repository>
        </repositories>
        <dependencies>
            <dependency>
                <groupId>com.github.drawethree</groupId>
                <artifactId>X-PrisonAPI</artifactId>
                <version>1.0</version>
                <scope>provided</scope>
            </dependency>
        </dependencies>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-jar-plugin</artifactId>
                <version>3.2.0</version>
                <configuration>
                    <archive>
                        <manifestEntries>
                            <X-Prison-Addon-Class>[Main Addon Class]</X-Prison-Addon-Class>
                            <X-Prison-Addon-Name>[Example Name]</X-Prison-Addon-Name>
                            <X-Prison-Addon-Description>[Example Description]</X-Prison-Addon-Description>
                            <X-Prison-Addon-Version>1.0</X-Prison-Addon-Version>
                            <X-Prison-Addon-Author>[Example Author]</X-Prison-Addon-Author>
                        </manifestEntries>
                    </archive>
                </configuration>
            </plugin>
        </plugins>
    `,
    usage: `
    === CORE API ===

    XPrisonAPI interface: dev.drawethree.xprison.api
    Static Methods
    - static XPrisonAPI getInstance()
    - static void setInstance(XPrisonAPI instance)
    
    Instance Methods
    - XPrisonAutoMinerAPI getAutoMinerApi()
    - XPrisonAutoSellAPI getAutoSellApi()
    - XPrisonEnchantsAPI getEnchantsApi()
    - XPrisonGangsAPI getGangsApi()
    - XPrisonHistoryAPI getHistoryApi()
    - XPrisonMinesAPI getMinesApi()
    - XPrisonMultipliersAPI getMultipliersApi()
    - XPrisonPickaxeLevelsAPI getPickaxeLevelsApi()
    - XPrisonPrestigesAPI getPrestigesApi()
    - XPrisonRanksAPI getRanksApi()
    - XPrisonBombsAPI getBombsApi()
    - XPrisonCurrencyAPI getCurrencyApi()
    - XPrisonMiningStatsAPI getMiningStatsApi()
    - XPrisonPickaxeSkinsAPI getPickaxeSkinsApi()
    - XPrisonRebirthAPI getRebirthApi()
    
    XPrisonModule interface: dev.drawethree.xprison.api
    Instance Methods
    - boolean isEnabled()
    - String getName()
    - boolean isHistoryEnabled()
    
    === ENCHANTS API ===
    
    XPrisonEnchantsAPI interface: dev.drawethree.xprison.api.enchants
    Instance Methods
    - Map<XPrisonEnchantment, Integer> getEnchants(ItemStack itemStack)
    - boolean hasEnchant(ItemStack item, XPrisonEnchantment enchantment)
    - boolean hasEnchant(ItemStack item, XPrisonEnchantment enchantment, int level)
    - int getEnchantLevel(ItemStack item, XPrisonEnchantment enchantment)
    - ItemStack setEnchantLevel(Player player, ItemStack item, XPrisonEnchantment enchantment, int level)
    - ItemStack removeEnchant(Player player, ItemStack item, XPrisonEnchantment enchantment)
    - XPrisonEnchantment getById(int id)
    - XPrisonEnchantment getByName(String rawName)
    - boolean registerEnchant(XPrisonEnchantment enchantment)
    - boolean unregisterEnchant(XPrisonEnchantment enchantment)
    - void ignoreBlockBreakEvent(BlockBreakEvent event)
    - boolean isEnchantAllowed(Location location)
    
    XPrisonEnchantment interface: dev.drawethree.xprison.api.enchants.model
    Instance Methods
    - int getId()
    - String getRawName()
    - String getName()
    - String getNameWithoutColor()
    - XPrisonEnchantmentGuiProperties getGuiProperties()
    - String getAuthor()
    - boolean isEnabled()
    - int getMaxLevel()
    - long getBaseCost()
    - long getCostAtLevel(int level)
    - void load()
    - void unload()
    - String getCurrencyName()
    - XPrisonCurrency getCurrency() (default)
    
    XPrisonEnchantmentBase abstract class: dev.drawethree.xprison.api.enchants.model
    Implements: XPrisonEnchantment, RefundableEnchant
    Constructors
    - XPrisonEnchantmentBase(File configFile)
    
    Instance Methods
    - void load()
    - long getCostAtLevel(int level)
    - File getConfigFile()
    - void setConfigFile(File configFile)
    - int getId()
    - String getRawName()
    - String getName()
    - String getNameWithoutColor()
    - boolean isEnabled()
    - int getMaxLevel()
    - long getBaseCost()
    - String getCostFormula()
    - XPrisonEnchantmentGuiProperties getGuiProperties()
    - String getCurrencyName()
    - boolean isRefundEnabled()
    - int getRefundGuiSlot()
    - double getRefundPercentage()
    
    Abstract Methods
    - void loadCustomProperties(JsonObject config)
    
    BlockBreakEnchant interface: dev.drawethree.xprison.api.enchants.model
    Instance Methods
    - void onBlockBreak(BlockBreakEvent event, int enchantLevel)
    
    ChanceBasedEnchant interface: dev.drawethree.xprison.api.enchants.model
    Instance Methods
    - double getChanceToTrigger(int enchantLevel)
    
    EquipabbleEnchantment interface: dev.drawethree.xprison.api.enchants.model
    Instance Methods
    - void onEquip(Player player, ItemStack pickaxe, int level)
    - void onUnequip(Player player, ItemStack pickaxe, int level)
    
    RefundableEnchant interface: dev.drawethree.xprison.api.enchants.model
    Instance Methods
    - boolean isRefundEnabled()
    - int getRefundGuiSlot()
    - double getRefundPercentage()
    
    RequiresPickaxeLevel interface: dev.drawethree.xprison.api.enchants.model
    Instance Methods
    - int getRequiredPickaxeLevel()
    
    XPrisonEnchantmentGuiProperties interface: dev.drawethree.xprison.api.enchants.model
    Instance Methods
    - int getGuiSlot()
    - Material getGuiMaterial()
    - String getGuiName()
    - Collection<String> getGuiDescription()
    - String getGuiBase64()
    - int getCustomModelData()
    
    === CURRENCY API ===
    
    XPrisonCurrencyAPI interface: dev.drawethree.xprison.api.currency
    Instance Methods
    - void registerCurrency(XPrisonCurrency currency)
    - void unregisterCurrency(XPrisonCurrency currency)
    - XPrisonCurrency getCurrency(String name)
    - Collection<XPrisonCurrency> getAllCurrencies()
    - double getBalance(OfflinePlayer player, String currencyName)
    - boolean addBalance(OfflinePlayer player, String currencyName, double amount, ReceiveCause receiveCause)
    - boolean removeBalance(OfflinePlayer player, String currencyName, double amount, LostCause lostCause)
    - boolean setBalance(OfflinePlayer player, String currencyName, double amount)
    - boolean has(OfflinePlayer player, String currencyName, double amount)
    
    XPrisonCurrency interface: dev.drawethree.xprison.api.currency.model
    Instance Methods
    - String getName()
    - double getMaxAmount()
    - String getDisplayName()
    - String getPrefix()
    - String getSuffix()
    - String format(double amount)
    - XPrisonCurrencyHandler getHandler() (default, returns null)
    
    XPrisonCurrencyHandler interface: dev.drawethree.xprison.api.currency.model
    Instance Methods
    - double getBalance(OfflinePlayer player)
    - boolean setBalance(OfflinePlayer player, double amount)
    - boolean addBalance(OfflinePlayer player, double amount, ReceiveCause receiveCause)
    - boolean removeBalance(OfflinePlayer player, double amount, LostCause lostCause)
    - boolean has(OfflinePlayer player, double amount)
    
    PhysicalItemCurrency interface: dev.drawethree.xprison.api.currency.model
    Instance Methods
    - ItemStack getPhysicalItem(double amount)
    
    ReceiveCause enum: dev.drawethree.xprison.api.currency.enums
    Values: MINING, PAY, GIVE, REDEEM, LUCKY_BLOCK, REFUND, MINING_OTHERS, UNKNOWN
    
    LostCause enum: dev.drawethree.xprison.api.currency.enums
    Values: PAY, ENCHANT, PRESTIGE, RANKUP, REBIRTH, ADMIN, WITHDRAW, UNKNOWN
    
    === MINES API ===
    
    XPrisonMinesAPI interface: dev.drawethree.xprison.api.mines
    Instance Methods
    - Collection<Mine> getMines()
    - Mine getMineByName(String name)
    - Mine getMineAtLocation(Location loc)
    - Mine createMine(MineSelection mineSelection, String name)
    - boolean deleteMine(Mine mine)
    - void resetMine(Mine mine)
    
    Mine interface: dev.drawethree.xprison.api.mines.model
    Instance Methods
    - String getName()
    - Region getRegion()
    - Point getTeleportLocation()
    - BlockPalette getBlockPalette()
    - double getResetPercentage()
    - int getTotalBlocks()
    - int getCurrentBlocks()
    - boolean isResetting()
    - Date getNextResetDate()
    - boolean isInMine(Location location)
    - Collection<Player> getPlayersInMine()
    - void addEffect(PotionEffectType potionEffectType, int level)
    - void removeEffect(PotionEffectType potionEffectType)
    - void handleBlockBreak(List<Block> blocks)
    
    MineSelection interface: dev.drawethree.xprison.api.mines.model
    Static Methods
    - static MineSelection of(Position position1, Position position2)
    
    Instance Methods
    - Position getPosition1()
    - Position getPosition2()
    
    BlockPalette interface: dev.drawethree.xprison.api.mines.model
    Instance Methods
    - boolean contains(XMaterial material)
    - double getPercentage(XMaterial material)
    - void setPercentage(XMaterial material, double percentage)
    - void add(XMaterial material, double percentage)
    - void remove(XMaterial material)
    
    === RANKS & PRESTIGE & REBIRTH ===
    
    XPrisonRanksAPI interface: dev.drawethree.xprison.api.ranks
    Instance Methods
    - Rank getRankById(int id)
    - Rank getPlayerRank(Player p)
    - Optional<Rank> getNextPlayerRank(Player player)
    - int getRankupProgress(Player player)
    - void setPlayerRank(Player player, Rank rank)
    - void resetPlayerRank(Player player)
    - boolean isMaxRank(Player player)
    
    Rank interface: dev.drawethree.xprison.api.ranks.model
    Instance Methods
    - int getId()
    - double getCost()
    - String getPrefix()
    
    XPrisonPrestigesAPI interface: dev.drawethree.xprison.api.prestiges
    Instance Methods
    - Prestige getPrestigeById(long id)
    - Prestige getPlayerPrestige(Player p)
    - void setPlayerPrestige(Player player, Prestige prestige)
    - void setPlayerPrestige(Player player, long prestigeId)
    - boolean isMaxPrestige(Player player)
    - void resetPlayerPrestige(Player player)
    
    Prestige interface: dev.drawethree.xprison.api.prestiges.model
    Instance Methods
    - long getId()
    - double getCost()
    - String getPrefix()
    
    XPrisonRebirthAPI interface: dev.drawethree.xprison.api.rebirth
    Instance Methods
    - Rebirth getRebirthById(int id)
    - Rebirth getPlayerRebirth(Player player)
    - Optional<Rebirth> getNextPlayerRebirth(Player player)
    - void setPlayerRebirth(Player player, Rebirth rebirth)
    - void resetPlayerRebirth(Player player)
    - boolean isMaxRebirth(Player player)
    - boolean tryRebirth(Player player)
    
    Rebirth interface: dev.drawethree.xprison.api.rebirth.model
    Instance Methods
    - int getId()
    - String getPrefix()
    - List<RebirthRequirement> getRequirements()
    - List<String> getRewardCommands()
    
    RebirthRequirement interface: dev.drawethree.xprison.api.rebirth.model
    Instance Methods
    - String getType()
    - boolean isEnabled()
    - boolean isMet(Player player)
    - void apply(Player player)
    - String getFailMessage()
    
    === PICKAXE FEATURES ===
    
    XPrisonPickaxeLevelsAPI interface: dev.drawethree.xprison.api.pickaxelevels
    Instance Methods
    - Optional<PickaxeLevel> getPickaxeLevel(ItemStack item)
    - Optional<PickaxeLevel> getPickaxeLevel(Player player)
    - Optional<PickaxeLevel> getPickaxeLevel(int level)
    - void setPickaxeLevel(Player player, ItemStack item, PickaxeLevel level)
    - void setPickaxeLevel(Player player, ItemStack item, int level)
    - String getProgressBar(Player player)
    
    PickaxeLevel interface: dev.drawethree.xprison.api.pickaxelevels.model
    Instance Methods
    - int getLevel()
    - long getBlocksRequired()
    - String getDisplayName()
    
    XPrisonPickaxeSkinsAPI interface: dev.drawethree.xprison.api.pickaxeskins
    Instance Methods
    - Optional<PickaxeSkin> getPickaxeSkin(ItemStack item)
    - Optional<PickaxeSkin> getPickaxeSkin(Player player)
    - Optional<PickaxeSkin> getPickaxeSkin(String id)
    - void setPickaxeSkin(Player player, ItemStack item, PickaxeSkin skin)
    
    PickaxeSkin interface: dev.drawethree.xprison.api.pickaxeskins.model
    Instance Methods
    - String getId()
    - String getName()
    - String getDescription()
    - int getCustomModelData()
    - Map<String, Double> getMultipliers()
    - String getPermission()
    - double getMultiplier(String currencyName)
    
    === MULTIPLIERS ===
    
    XPrisonMultipliersAPI interface: dev.drawethree.xprison.api.multipliers
    Instance Methods
    - Multiplier getGlobalMultiplier(XPrisonCurrency currency)
    - PlayerMultiplier getPlayerMultiplier(Player p, XPrisonCurrency currency)
    
    Multiplier interface: dev.drawethree.xprison.api.multipliers.model
    Instance Methods
    - double getMultiplier()
    - void setMultiplier(double newValue)
    - void addMultiplier(double addition)
    - boolean isActive()
    - void reset()
    - Date getEndDate()
    
    PlayerMultiplier interface: dev.drawethree.xprison.api.multipliers.model
    Extends: Multiplier
    Instance Methods
    - OfflinePlayer getOfflinePlayer()
    
    === GANGS ===
    
    XPrisonGangsAPI interface: dev.drawethree.xprison.api.gangs
    Instance Methods
    - Optional<Gang> getPlayerGang(OfflinePlayer player)
    - Optional<Gang> getByName(String name)
    - Collection<Gang> getAllGangs()
    - GangCreateResult createGang(String name, Player gangLeader)
    - void disbandGang(Gang gang)
    - GangNameCheckResult checkGangName(String name)
    
    Gang interface: dev.drawethree.xprison.api.gangs.model
    Instance Methods
    - OfflinePlayer getOwnerOffline()
    - String getName()
    - boolean isOwner(OfflinePlayer player)
    - boolean isInGang(OfflinePlayer player)
    - Collection<GangInvitation> getPendingInvites()
    - long getGangValue()
    - Collection<Player> getOnlineMembers()
    - Collection<OfflinePlayer> getAllMembers()
    - GangInvitation invitePlayer(OfflinePlayer player)
    - void removeInvite(GangInvitation invitation)
    
    GangInvitation interface: dev.drawethree.xprison.api.gangs.model
    Instance Methods
    - Gang getGang()
    - OfflinePlayer getInvitedBy()
    - OfflinePlayer getInvitedPlayer()
    - Date getInviteDate()
    
    GangCreateResult enum: dev.drawethree.xprison.api.gangs.enums
    Values: SUCCESS, NAME_RESTRICTED, NAME_TOO_LONG, NAME_CONTAINS_COLORS, NAME_TAKEN, NAME_EMPTY, PLAYER_HAS_GANG, EVENT_CANCELLED
    
    GangNameCheckResult enum: dev.drawethree.xprison.api.gangs.enums
    Values: SUCCESS, NAME_RESTRICTED, NAME_TOO_LONG, NAME_CONTAINS_COLORS, NAME_TAKEN, NAME_EMPTY
    
    GangLeaveReason enum: dev.drawethree.xprison.api.gangs.enums
    Values: ADMIN, KICK, LEAVE
    
    === BOMBS ===
    
    XPrisonBombsAPI interface: dev.drawethree.xprison.api.bombs
    Instance Methods
    - void giveBomb(Bomb bomb, int amount, Player player)
    - Optional<Bomb> getBombByName(String name)
    
    Bomb interface: dev.drawethree.xprison.api.bombs.model
    Instance Methods
    - String getName()
    - int getRadius()
    - ItemStack getItem()
    - Sound getDropSound()
    - Sound getExplodeSound()
    - int getExplosionDelay()
    
    BombExplodeEvent class: dev.drawethree.xprison.api.bombs.events
    Extends: Event, Implements: Cancellable
    Constructors
    - BombExplodeEvent(Bomb bomb, Player player, Location location, List<Block> affectedBlocks)
    
    Instance Methods
    - Bomb getBomb()
    - Player getPlayer()
    - Location getLocation()
    - List<Block> getOriginalBlocks()
    - List<Block> getAffectedBlocks()
    - void addAffectedBlocks(Collection<Block> blocks)
    - void addAffectedBlock(Block block)
    - void setAffectedBlocks(List<Block> blocks)
    - boolean isCancelled()
    - void setCancelled(boolean cancelled)
    - HandlerList getHandlers()
    
    Static Methods
    - static HandlerList getHandlerList()
    
    === AUTOSELL ===
    
    XPrisonAutoSellAPI interface: dev.drawethree.xprison.api.autosell
    Instance Methods
    - double getPriceForItem(ItemStack item)
    - double getPriceForBlock(Block block)
    - void sellBlocks(Player player, List<Block> blocks)
    - boolean hasAutoSellEnabled(Player p)
    - void addSellPrice(XMaterial material, double price)
    - void removeSellPrice(XMaterial material)
    - double getSellPriceForMaterial(XMaterial material)
    
    AutoSellItemStack interface: dev.drawethree.xprison.api.autosell.model
    Instance Methods
    - ItemStack getItemStack()
    
    === AUTOMINER ===
    
    XPrisonAutoMinerAPI interface: dev.drawethree.xprison.api.autominer
    Instance Methods
    - boolean isInAutoMinerRegion(Player player)
    - int getAutoMinerTime(Player player)
    - Collection<AutoMinerRegion> getAutoMinerRegions()
    
    AutoMinerRegion interface: dev.drawethree.xprison.api.autominer.model
    Instance Methods
    - World getWorld()
    - IWrappedRegion getRegion()
    - Collection<String> getCommands()
    - int getRewardPeriod()
    - int getBlocksBroken()
    
    === MINING STATS ===
    
    XPrisonMiningStatsAPI interface: dev.drawethree.xprison.api.miningstats
    Instance Methods
    - MiningStats getStats(Player player)
    
    MiningStats interface: dev.drawethree.xprison.api.miningstats.model
    Instance Methods
    - Player getPlayer()
    - int getBlocksMined()
    - Map<XPrisonCurrency, Double> getCurrenciesEarned()
    - Map<XPrisonEnchantment, Integer> getEnchantProcs()
    
    === HISTORY ===
    
    XPrisonHistoryAPI interface: dev.drawethree.xprison.api.history
    Instance Methods
    - Collection<HistoryLine> getPlayerHistory(OfflinePlayer player)
    - Collection<HistoryLine> getPlayerHistory(OfflinePlayer player, XPrisonModule module)
    - HistoryLine createHistoryLine(OfflinePlayer player, XPrisonModule module, String context)
    
    HistoryLine interface: dev.drawethree.xprison.api.history.model
    Instance Methods
    - OfflinePlayer getOfflinePlayer()
    - String getModule()
    - String getContext()
    - Date getCreatedAt()
    
    === EVENTS ===
    
    XPrisonEvent abstract class: dev.drawethree.xprison.api.shared.events
    Extends: Event
    
    XPrisonPlayerEvent abstract class: dev.drawethree.xprison.api.shared.events.player
    Extends: XPrisonEvent
    Constructors
    - XPrisonPlayerEvent(OfflinePlayer player)
    
    Instance Methods
    - OfflinePlayer getPlayer()
    - Player getPlayerOnline()
    
    XPrisonBlockBreakEvent class: dev.drawethree.xprison.api.shared.events
    Extends: XPrisonPlayerEvent, Implements: Cancellable
    Constructors
    - XPrisonBlockBreakEvent(Player player, List<Block> blocks)
    
    Instance Methods
    - Player getPlayer()
    - List<Block> getBlocks()
    - boolean isCancelled()
    - void setCancelled(boolean cancelled)
    - void setPlayer(Player player)
    - void setBlocks(List<Block> blocks)
    - HandlerList getHandlers()
    
    Static Methods
    - static HandlerList getHandlerList()
    
    PlayerRankUpEvent class: dev.drawethree.xprison.api.ranks.events
    PlayerRebirthEvent class: dev.drawethree.xprison.api.rebirth.events
    XPrisonEnchantRegisterEvent class: dev.drawethree.xprison.api.enchants.events
    XPrisonEnchantUnregisterEvent class: dev.drawethree.xprison.api.enchants.events
    XPrisonEnchantPreTriggerEvent class: dev.drawethree.xprison.api.enchants.events
    XPrisonEnchantTriggerEvent class: dev.drawethree.xprison.api.enchants.events
    XPrisonPlayerEnchantEvent class: dev.drawethree.xprison.api.enchants.events
    PlayerCurrencyReceiveEvent class: dev.drawethree.xprison.api.currency.event
    PlayerCurrencyLoseEvent class: dev.drawethree.xprison.api.currency.event
    PlayerMultiplierReceiveEvent class: dev.drawethree.xprison.api.multipliers.events
    MineCreateEvent, MineDeleteEvent, MinePreResetEvent, MinePostResetEvent classes: dev.drawethree.xprison.api.mines.events
    GangCreateEvent, GangDisbandEvent, GangJoinEvent, GangLeaveEvent classes: dev.drawethree.xprison.api.gangs.events
    XPrisonAutoSellEvent, XPrisonSellAllEvent classes: dev.drawethree.xprison.api.autosell.events
    PlayerAutomineEvent, PlayerAutoMinerTimeModifyEvent classes: dev.drawethree.xprison.api.autominer.events
    
    === UTILITY CLASSES ===
    
    JsonUtils class: dev.drawethree.xprison.api.utils
    Static Methods
    - static String getRequiredString(JsonObject obj, String key)
    - static int getRequiredInt(JsonObject obj, String key)
    - static double getRequiredDouble(JsonObject obj, String key)
    - static long getRequiredLong(JsonObject obj, String key)
    - static boolean getRequiredBoolean(JsonObject obj, String key)
    - static JsonObject getRequiredObject(JsonObject parent, String key)
    - static <T> T getRequired(JsonObject obj, String key, Class<T> clazz)
    - static List<String> getRequiredStringList(JsonObject obj, String key)
    - static String getOptionalString(JsonObject obj, String key, String defaultValue)
    - static int getOptionalInt(JsonObject obj, String key, int defaultValue)
    
    === ADDONS ===
    
    XPrisonAddon interface: dev.drawethree.xprison.api.addons
    Instance Methods
    - void onEnable()
    - void onDisable()
    
    XPrisonAPITestAddon class: dev.drawethree.xprison.api.test (example implementation)
    Implements: XPrisonAddon
    Static Methods
    - static XPrisonAPITestAddon getINSTANCE()
    
    Instance Methods
    - void onEnable()
    - void onDisable()
    - XPrisonAPI getApi()
    
    === EXCEPTIONS ===
    
    ModuleNotEnabledException class: dev.drawethree.xprison.api.exception
    Extends: Exception
    Constructors
    - ModuleNotEnabledException(XPrisonModule module)
    
    === CUSTOM ENCHANTMENT CREATION EXAMPLES ===
    
    ## Example 1: DiamondGiver (Chance-Based Block Break Enchant)
    
    JSON Configuration (diamondgiver.json):
    {
      "id": 100,
      "rawName": "diamondgiver",
      "name": "&bDiamond Giver",
      "enabled": true,
      "increaseCostBy": 350,
      "baseChance": 20,
      "maxLevel": 5,
      "initialCost": 10000,
      "currency": "Tokens",
      "refund": { "enabled": true, "guiSlot": 52, "percentage": 50.0 },
      "gui": {
        "name": "&bDiamond Giver",
        "material": "DIAMOND",
        "slot": 52,
        "description": ["&7Gives diamonds when mining!"]
      }
    }
    
    Implementation Pattern:
    - Extend XPrisonEnchantmentBase
    - Implement BlockBreakEnchant for block break behavior
    - Implement ChanceBasedEnchant for trigger chance
    - Override loadCustomProperties() to load custom config values (baseChance)
    - Override onBlockBreak() to define what happens when triggered
    - Override getChanceToTrigger() to return chance calculation
    
    ## Example 2: Invisibility (Equipable Effect Enchant)
    
    JSON Configuration (invisibility.json):
    {
      "id": 101,
      "rawName": "invisibility",
      "name": "&fInvisibility",
      "enabled": true,
      "increaseCostBy": 350,
      "maxLevel": 1,
      "initialCost": 10000,
      "currency": "Tokens",
      "refund": { "enabled": true, "guiSlot": 51, "percentage": 50.0 },
      "gui": {
        "name": "&fInvisibility",
        "material": "FEATHER",
        "slot": 51,
        "description": ["&7Invisibility while holding pickaxe!"]
      }
    }
    
    Implementation Pattern:
    - Extend XPrisonEnchantmentBase
    - Implement EquipabbleEnchantment for equip/unequip behavior
    - Override onEquip() to apply effects when pickaxe is equipped
    - Override onUnequip() to remove effects when pickaxe is unequipped
    - Override loadCustomProperties() even if no custom properties needed
    
    Key Addon Registration Pattern:
    1. Place addon JAR in plugins/X-Prison/addons/
    2. Implement XPrisonAddon interface
    3. In onEnable(): Get XPrisonAPI instance, create enchant instances with config files, call load(), register via api.getEnchantsApi().registerEnchant()
    4. In onDisable(): Unregister enchants via api.getEnchantsApi().unregisterEnchant()
    
    Example Code:
    package dev.drawethree.xprison.api.test;

    import dev.drawethree.xprison.api.XPrisonAPI;
    import dev.drawethree.xprison.api.addons.XPrisonAddon;
    import dev.drawethree.xprison.api.enchants.model.XPrisonEnchantment;
    import dev.drawethree.xprison.api.test.enchant.DiamondGiverEnchant;
    import dev.drawethree.xprison.api.test.enchant.InvisibilityEnchant;
    import org.bukkit.Bukkit;
    
    import java.io.File;
    import java.io.IOException;
    import java.io.InputStream;
    import java.net.URL;
    import java.nio.file.Files;
    import java.nio.file.StandardCopyOption;
    import java.util.ArrayList;
    import java.util.List;
    
    /**
     * A test addon for the XPrisonAPI.
     * <p>
     * This addon demonstrates how to register and manage custom enchantments
     * using the XPrison enchantments API. On plugin enable, it loads configuration
     * files for the custom enchants, registers them with the XPrison API,
     * and unregisters them on plugin disable.
     *
     * IMPORTANT!
     * Jar file should be placed under plugins/X-Prison/addons
     */
    public final class XPrisonAPITestAddon implements XPrisonAddon {
    
        private static XPrisonAPITestAddon INSTANCE;
        private XPrisonAPI api;
        private List<XPrisonEnchantment> customEnchants;
        private File dataFolder;
    
        /**
         * Gets the singleton instance of this plugin.
         *
         * @return the instance of XPrisonAPITest
         */
        public static XPrisonAPITestAddon getINSTANCE() {
            return INSTANCE;
        }
    
        /**
         * Called when the addon is enabled.
         * Initializes the API, copies default config files for enchantments,
         * initializes enchantment instances, loads their configuration,
         * and registers them with the API.
         */
        @Override
        public void onEnable() {
            INSTANCE = this;
            api = XPrisonAPI.getInstance();
    
            this.dataFolder = new File(Bukkit.getPluginManager().getPlugin("X-Prison").getDataFolder(), "addons-data/XPrisonAPITestAddon");
            if (!dataFolder.exists()) {
                dataFolder.mkdirs();
            }
    
            copyDefaultEnchantConfigurations();
    
            initEnchants();
            loadEnchants();
            registerEnchants();
        }
    
        /**
         * Initializes the custom enchantments and their configuration files.
         */
        private void initEnchants() {
            customEnchants = new ArrayList<>();
    
            File diamondGiverConfigFile = new File(dataFolder, "diamondgiver.json");
            File invisibilityConfigFile = new File(dataFolder, "invisibility.json");
    
            customEnchants.add(new DiamondGiverEnchant(diamondGiverConfigFile));
            customEnchants.add(new InvisibilityEnchant(invisibilityConfigFile));
        }
    
        /**
         * Loads each custom enchantment from its corresponding configuration file.
         */
        private void loadEnchants() {
            customEnchants.forEach(XPrisonEnchantment::load);
        }
    
        /**
         * Registers each custom enchantment with the XPrison enchantment API.
         */
        private void registerEnchants() {
            customEnchants.forEach(enchantment -> api.getEnchantsApi().registerEnchant(enchantment));
        }
    
        /**
         * Copies the default configuration files for the enchantments
         * from the plugin's resources to the plugins/X-Prison/addon-data/XPrisonAPITestAddon
         * if they do not already exist.
         */
        private void copyDefaultEnchantConfigurations() {
            if (!dataFolder.exists()) {
                dataFolder.mkdirs();
            }
    
            String[] enchantFiles = {"diamondgiver.json", "invisibility.json"};
    
            for (String fileName : enchantFiles) {
                File outFile = new File(dataFolder, fileName);
                URL resource = XPrisonAPITestAddon.class.getResource("/" + fileName);
                System.out.println(resource.toString());
                if (!outFile.exists()) {
                    try (InputStream in = XPrisonAPITestAddon.class.getResourceAsStream("/" + fileName)) {
                        if (in != null) {
                            Files.copy(in, outFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                            Bukkit.getLogger().info("[XPrisonAPITestAddon] Copied " + fileName);
                        } else {
                            Bukkit.getLogger().warning("[XPrisonAPITestAddon] Could not find " + fileName + " in resources!");
                        }
                    } catch (IOException e) {
                        Bukkit.getLogger().warning("[XPrisonAPITestAddon] Failed to copy " + fileName + ": " + e.getMessage());
                    }
                }
            }
        }
    
        /**
         * Called when the plugin is disabled.
         * Unregisters all custom enchantments from the XPrison API.
         */
        @Override
        public void onDisable() {
            customEnchants.forEach(enchantment -> api.getEnchantsApi().unregisterEnchant(enchantment));
        }
    
        /**
         * Gets the instance of the XPrison API used by this plugin.
         *
         * @return the XPrisonAPI instance
         */
        public XPrisonAPI getApi() {
            return api;
        }
    }
    package dev.drawethree.xprison.api.test.enchant;

    import com.google.gson.JsonObject;
    import dev.drawethree.xprison.api.enchants.model.BlockBreakEnchant;
    import dev.drawethree.xprison.api.enchants.model.ChanceBasedEnchant;
    import dev.drawethree.xprison.api.enchants.model.XPrisonEnchantmentBase;
    import org.bukkit.Material;
    import org.bukkit.entity.Player;
    import org.bukkit.event.block.BlockBreakEvent;
    import org.bukkit.inventory.ItemStack;
    
    import java.io.File;
    
    /**
     * A custom enchantment that gives players a diamond when they break a block.
     * The enchantment is chance-based and scales with the enchantment level.
     * <p>
     * This class extends {@link XPrisonEnchantmentBase} and implements both
     * {@link BlockBreakEnchant} and {@link ChanceBasedEnchant}.
     */
    public class DiamondGiverEnchant extends XPrisonEnchantmentBase implements BlockBreakEnchant, ChanceBasedEnchant {
    
        /**
         * The base chance of the enchantment triggering, per level.
         */
        private double baseChance;
    
        /**
         * Constructs a new DiamondGiverEnchant using a {@link File} instance for configuration.
         *
         * @param configFile The JSON configuration file.
         */
        public DiamondGiverEnchant(File configFile) {
            super(configFile);
        }
    
        /**
         * Called when a block is broken by a player.
         * If triggered, gives the player one diamond and sends a message.
         *
         * @param blockBreakEvent The block break event.
         * @param enchantLevel    The level of the enchantment on the item.
         */
        @Override
        public void onBlockBreak(BlockBreakEvent blockBreakEvent, int enchantLevel) {
            Player player = blockBreakEvent.getPlayer();
            player.getInventory().addItem(new ItemStack(Material.DIAMOND, 1));
            player.sendMessage("Olala! You got a diamond!");
        }
    
        /**
         * Loads custom properties from the JSON config.
         * Specifically, this reads the {@code baseChance} property.
         *
         * @param jsonObject The JSON object containing the configuration.
         */
        @Override
        protected void loadCustomProperties(JsonObject jsonObject) {
            baseChance = jsonObject.get("baseChance").getAsDouble();
        }
    
        /**
         * Returns the author of this enchantment.
         *
         * @return The author's name.
         */
        @Override
        public String getAuthor() {
            return "ExampleDev";
        }
    
        /**
         * Called when the enchantment is unloaded.
         * No specific cleanup is required in this implementation.
         */
        @Override
        public void unload() {
            // No custom unload logic needed
        }
    
        /**
         * Calculates the chance that this enchantment will trigger.
         * The chance scales linearly with the enchantment level.
         *
         * @param level The level of the enchantment.
         * @return The calculated trigger chance.
         */
        @Override
        public double getChanceToTrigger(int level) {
            return baseChance * level;
        }
    }
    package dev.drawethree.xprison.api.test.enchant;
    
    import com.google.gson.JsonObject;
    import dev.drawethree.xprison.api.enchants.model.EquipabbleEnchantment;
    import dev.drawethree.xprison.api.enchants.model.XPrisonEnchantmentBase;
    import org.bukkit.ChatColor;
    import org.bukkit.entity.Player;
    import org.bukkit.inventory.ItemStack;
    import org.bukkit.potion.PotionEffect;
    import org.bukkit.potion.PotionEffectType;
    
    import java.io.File;
    
    /**
     * A custom enchantment that grants the player invisibility when equipped,
     * and removes it when unequipped.
     * <p>
     * This class extends {@link XPrisonEnchantmentBase} and implements
     * {@link EquipabbleEnchantment}, meaning it activates effects on item equip/unequip.
     */
    public class InvisibilityEnchant extends XPrisonEnchantmentBase implements EquipabbleEnchantment {
    
        /**
         * Constructs a new {@code InvisibilityEnchant} from a {@link File} configuration.
         *
         * @param configFile JSON configuration file.
         */
        public InvisibilityEnchant(File configFile) {
            super(configFile);
        }
    
        /**
         * Called when a player equips an item with this enchantment.
         * Grants the player permanent invisibility while the item is equipped.
         *
         * @param player    The player who equipped the item.
         * @param itemStack The item that was equipped.
         * @param i         The level of the enchantment (unused in this case).
         */
        @Override
        public void onEquip(Player player, ItemStack itemStack, int i) {
            player.addPotionEffect(new PotionEffect(PotionEffectType.INVISIBILITY, -1, 1));
            player.sendMessage(ChatColor.GREEN + "You are now Invisible");
        }
    
        /**
         * Called when a player unequips an item with this enchantment.
         * Removes the invisibility effect from the player.
         *
         * @param player    The player who unequipped the item.
         * @param itemStack The item that was unequipped.
         * @param i         The level of the enchantment (unused in this case).
         */
        @Override
        public void onUnequip(Player player, ItemStack itemStack, int i) {
            player.removePotionEffect(PotionEffectType.INVISIBILITY);
            player.sendMessage(ChatColor.RED + "You are now Visible");
        }
    
        /**
         * Loads custom properties from the configuration file.
         * This enchantment does not use custom config properties.
         *
         * @param jsonObject The JSON configuration object.
         */
        @Override
        protected void loadCustomProperties(JsonObject jsonObject) {
            // No custom properties to load
        }
    
        /**
         * Returns the author's name for this enchantment.
         *
         * @return The author's name.
         */
        @Override
        public String getAuthor() {
            return "ExampleDev";
        }
    
        /**
         * Unloads the enchantment.
         * No cleanup logic required in this implementation.
         */
        @Override
        public void unload() {
            // No specific unload logic needed
        }
    }
    `
};