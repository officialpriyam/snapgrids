module.exports = {
    name: 'Bedwars1058',
    description: 'Minecraft bedwars plugin.',
    pluginId: 'BedWars1058',
    mavenIntegration: `
    <repositories>
      <repository>
        <id>andrei1058-repo</id>
        <url>https://repo.andrei1058.dev/releases/</url>
      </repository>
    </repositories>
    <!--BedWars1058 API-->
    <dependency>
      <groupId>com.andrei1058.bedwars</groupId>
      <artifactId>bedwars-api</artifactId>
      <version>25.9</version>
    </dependency>
    `,
    usage: `
    Add it as depend in plugin.yml: depend: [BedWars1058]
    Check if BedWars1058 is on the server:
    @Override
    public void onEnable() {
        //Disable if pl not found
        if (Bukkit.getPluginManager().getPlugin("BedWars1058") == null) {
                getLogger().severe("BedWars1058 was not found. Disabling...");
                Bukkit.getPluginManager().disablePlugin(this);
                return;
        }
    }
    
    Getting API Methods
    Initializing the API:
    com.andrei1058.bedwars.api.BedWars bedwarsAPI = Bukkit.getServicesManager().getRegistration(BedWars.class).getProvider();
    
    BedWars interface: com.andrei1058.bedwars.api
    Description: Main API entry point for BedWars1058 plugin
    Instance Methods:
    
    IStats getStatsUtil() - Returns the statistics utility interface
    AFKUtil getAFKUtil() - Returns the AFK system utility interface
    ArenaUtil getArenaUtil() - Returns the arena utility interface
    Configs getConfigs() - Returns the configuration utility interface
    ShopUtil getShopUtil() - Returns the shop utility interface
    TeamUpgradesUtil getTeamUpgradesUtil() - Returns the team upgrades utility interface
    Level getLevelsUtil() - Returns the levels utility interface
    Party getPartyUtil() - Returns the party utility interface
    ISetupSession getSetupSession(UUID player) - Gets active setup session for player (null if none)
    boolean isInSetupSession(UUID player) - Checks if player is in setup session
    ServerType getServerType() - Gets the server type (BUNGEE/MULTIARENA/SHARED)
    String getLangIso(Player p) - Gets player's language ISO code
    ParentCommand getBedWarsCommand() - Gets the main BedWars command
    RestoreAdapter getRestoreAdapter() - Gets the arena restore adapter
    void setRestoreAdapter(RestoreAdapter restoreAdapter) - Changes the arena restore adapter
    void setPartyAdapter(Party partyAdapter) - Changes the party interface
    VersionSupport getVersionSupport() - Gets NMS operations handler
    Language getDefaultLang() - Gets server default language
    String getLobbyWorld() - Gets lobby world name
    String getForCurrentVersion(String v18, String v12, String v13) - Gets version-specific string
    void setLevelAdapter(Level level) - Sets custom level adapter
    boolean isAutoScale() - Checks if auto-scaling is enabled
    Language getLanguageByIso(String isoCode) - Gets language by ISO code
    Language getPlayerLanguage(Player player) - Gets a player's language
    File getAddonsPath() - Gets the addons configuration path
    ScoreboardUtil getScoreboardUtil() - Gets scoreboard utility
    boolean isShuttingDown() - Checks if server is shutting down
    ISidebarService getScoreboardManager() - Gets sidebar service
    
    Inner Interfaces:
    IStats
    
    Timestamp getPlayerFirstPlay(UUID p) - Gets player first play date
    Timestamp getPlayerLastPlay(UUID p) - Gets player last play date
    int getPlayerWins(UUID p) - Gets player total wins
    int getPlayerKills(UUID p) - Gets player regular kills
    int getPlayerTotalKills(UUID p) - Gets player total kills (regular + final)
    int getPlayerFinalKills(UUID p) - Gets player final kills
    int getPlayerLoses(UUID p) - Gets player total losses
    int getPlayerDeaths(UUID p) - Gets player total deaths
    int getPlayerFinalDeaths(UUID p) - Gets player final deaths
    int getPlayerBedsDestroyed(UUID p) - Gets player beds destroyed
    int getPlayerGamesPlayed(UUID p) - Gets player games played
    
    AFKUtil
    
    boolean isPlayerAFK(Player player) - Checks if player is AFK
    void setPlayerAFK(Player player, boolean value) - Sets player AFK status
    int getPlayerTimeAFK(Player player) - Gets seconds since player went AFK
    
    ArenaUtil
    
    boolean canAutoScale(String arenaName) - Checks if arena can be auto-scaled
    void addToEnableQueue(IArena a) - Adds arena to enable queue
    void removeFromEnableQueue(IArena a) - Removes arena from enable queue
    boolean isPlaying(Player p) - Checks if player is playing
    boolean isSpectating(Player p) - Checks if player is spectating
    void loadArena(String worldName, Player sender) - Loads an arena
    void setGamesBeforeRestart(int games) - Sets games until restart (BUNGEE mode)
    int getGamesBeforeRestart() - Gets games until restart (BUNGEE mode)
    IArena getArenaByPlayer(Player player) - Gets arena by player
    void setArenaByPlayer(Player p, IArena arena) - Sets arena for player
    void removeArenaByPlayer(Player p, IArena a) - Removes arena association
    IArena getArenaByName(String worldName) - Gets arena by world name
    IArena getArenaByIdentifier(String worldName) - Gets arena by identifier
    void setArenaByName(IArena arena) - Sets arena by name
    void removeArenaByName(String worldName) - Removes arena by name
    LinkedList<IArena> getArenas() - Gets all arenas
    boolean vipJoin(Player p) - Checks if player has VIP join
    int getPlayers(String group) - Gets player count for group
    boolean joinRandomArena(Player p) - Adds player to most filled arena
    boolean joinRandomFromGroup(Player p, String group) - Adds player to most filled arena in group
    LinkedList<IArena> getEnableQueue() - Gets arena enable queue
    void sendLobbyCommandItems(Player p) - Gives lobby items to player
    
    Configs
    
    ConfigManager getMainConfig() - Gets main configuration
    ConfigManager getSignsConfig() - Gets signs configuration
    ConfigManager getGeneratorsConfig() - Gets generators configuration
    ConfigManager getShopConfig() - Gets shop configuration
    ConfigManager getUpgradesConfig() - Gets upgrades configuration
    
    ShopUtil
    
    int calculateMoney(Player player, Material currency) - Gets player's currency amount
    Material getCurrency(String currency) - Gets currency as material (AIR if vault)
    ChatColor getCurrencyColor(Material currency) - Gets currency color
    String getCurrencyMsgPath(IContentTier contentTier) - Gets currency path
    String getRomanNumber(int n) - Converts int to roman numeral
    void takeMoney(Player player, Material currency, int amount) - Takes money from player
    
    TeamUpgradesUtil
    
    boolean isWatchingGUI(Player player) - Checks if player is watching upgrades menu
    void setWatchingGUI(Player player) - Sets player watching upgrades menu
    void removeWatchingUpgrades(UUID uuid) - Removes from upgrades GUI
    int getTotalUpgradeTiers(IArena arena) - Gets total upgrade tiers in arena
    
    ScoreboardUtil
    
    void removePlayerScoreboard(Player player) - Removes player's scoreboard
    void givePlayerScoreboard(Player player, boolean delay) - Gives player scoreboard
    
    
    IArena interface: com.andrei1058.bedwars.api.arena
    Description: Interface representing a BedWars arena instance
    Instance Methods:
    
    boolean isSpectator(Player player) - Checks if player is spectator
    boolean isSpectator(UUID player) - Checks if UUID is spectator
    boolean isReSpawning(UUID player) - Checks if player is respawning
    String getArenaName() - Gets arena world name
    void init(World world) - Initializes arena after world load
    ConfigManager getConfig() - Gets arena configuration
    boolean isPlayer(Player player) - Checks if player is playing
    List<Player> getSpectators() - Gets spectator list
    ITeam getTeam(Player player) - Gets player's team (alive only)
    ITeam getExTeam(UUID player) - Gets team where player played (eliminated)
    String getDisplayName() - Gets formatted arena name
    void setWorldName(String name) - Sets world name for auto-scaling
    GameState getStatus() - Gets arena status
    List<Player> getPlayers() - Gets players in arena
    int getMaxPlayers() - Gets maximum allowed players
    String getGroup() - Gets arena group
    int getMaxInTeam() - Gets maximum players per team
    ConcurrentHashMap<Player, Integer> getRespawnSessions() - Gets respawn sessions
    void updateSpectatorCollideRule(Player p, boolean collide) - Updates spectator collisions
    void updateNextEvent() - Updates next event
    boolean addPlayer(Player p, boolean skipOwnerCheck) - Adds player to arena
    boolean addSpectator(Player p, boolean playerBefore, Location staffTeleport) - Adds spectator
    void removePlayer(Player p, boolean disconnect) - Removes player from arena
    void removeSpectator(Player p, boolean disconnect) - Removes spectator
    boolean reJoin(Player p) - Rejoins arena
    void disable() - Disables arena
    void restart() - Restarts arena
    World getWorld() - Gets arena world
    String getDisplayStatus(Language lang) - Gets display status
    String getDisplayGroup(Player player) - Gets display group for player
    String getDisplayGroup(Language language) - Gets display group for language
    List<ITeam> getTeams() - Gets all teams
    void addPlacedBlock(Block block) - Adds placed block to cache
    Map<UUID, Long> getFireballCooldowns() - Gets fireball cooldowns
    void removePlacedBlock(Block block) - Removes placed block
    boolean isBlockPlaced(Block block) - Checks if block was placed by player
    int getPlayerKills(Player p, boolean finalKills) - Gets player kills (deprecated)
    GameStatsHolder getStatsHolder() - Gets session stats holder
    int getPlayerBedsDestroyed(Player p) - Gets beds destroyed (deprecated)
    List<Block> getSigns() - Gets join signs
    int getIslandRadius() - Gets island radius
    void setGroup(String group) - Sets arena group
    void setStatus(GameState status) - Sets game status without starting tasks
    void changeStatus(GameState status) - Changes game status starting tasks
    void addSign(Location loc) - Adds join sign
    void refreshSigns() - Refreshes signs
    void addPlayerKill(Player p, boolean finalKill, Player victim) - Adds kill (deprecated)
    void addPlayerBedDestroyed(Player p) - Adds bed destroyed (deprecated)
    ITeam getPlayerTeam(String playerName) - Gets team by player name (deprecated)
    void checkWinner() - Checks for winner
    void addPlayerDeath(Player p) - Adds death (deprecated)
    void setNextEvent(NextEvent nextEvent) - Sets next event
    NextEvent getNextEvent() - Gets next event
    void sendPreGameCommandItems(Player p) - Gives pre-game items
    void sendSpectatorCommandItems(Player p) - Gives spectator items
    ITeam getTeam(String name) - Gets team by name
    StartingTask getStartingTask() - Gets starting task
    PlayingTask getPlayingTask() - Gets playing task
    RestartingTask getRestartingTask() - Gets restarting task
    List<IGenerator> getOreGenerators() - Gets ore generators
    List<String> getNextEvents() - Gets list of next events
    int getPlayerDeaths(Player p, boolean finalDeaths) - Gets player deaths (deprecated)
    void sendDiamondsUpgradeMessages() - Sends diamond upgrade announcement
    void sendEmeraldsUpgradeMessages() - Sends emerald upgrade announcement
    LinkedList<Vector> getPlaced() - Gets placed blocks list
    void destroyData() - Destroys arena data
    int getUpgradeDiamondsCount() - Gets diamond generator tier
    int getUpgradeEmeraldsCount() - Gets emerald generator tier
    List<Region> getRegionsList() - Gets regions list
    ConcurrentHashMap<Player, Integer> getShowTime() - Gets invisibility armor timers
    void setAllowSpectate(boolean allowSpectate) - Sets spectating allowed
    boolean isAllowSpectate() - Checks if spectating allowed
    String getWorldName() - Gets world name
    int getRenderDistance() - Gets render distance in blocks
    boolean startReSpawnSession(Player player, int seconds) - Starts respawn countdown
    boolean isReSpawning(Player player) - Checks if player is respawning
    Location getReSpawnLocation() - Gets respawn location
    Location getSpectatorLocation() - Gets spectator spawn location
    Location getWaitingLocation() - Gets waiting location
    boolean isProtected(Location location) - Checks if location is protected
    void abandonGame(Player player) - Handles player abandoning game
    int getYKillHeight() - Gets void kill height (-1 = disabled)
    int getYHeightLimit() - Gets build height limit
    Instant getStartTime() - Gets arena start time
    ITeamAssigner getTeamAssigner() - Gets team assigner
    void setTeamAssigner(ITeamAssigner teamAssigner) - Sets team assigner
    List<Player> getLeavingPlayers() - Gets leaving players list
    boolean isAllowMapBreak() - Checks if map breaking allowed
    void setAllowMapBreak(boolean allowMapBreak) - Sets map breaking allowed
    boolean isTeamBed(Location location) - Checks if bed at location
    ITeam getBedsTeam(Location location) - Gets team owning bed at location
    ITeam getWinner() - Gets winner team (populated on restarting)
    int getDiamondTier() - Gets current diamond generator tier
    int getEmeraldTier() - Gets current emerald generator tier
    
    
    ITeam interface: com.andrei1058.bedwars.api.arena.team
    Description: Interface representing a team in an arena
    Instance Methods:
    
    UUID getIdentity() - Gets runtime identifier
    TeamColor getColor() - Gets team color
    String getName() - Gets team name
    String getDisplayName(Language language) - Gets display name in language
    boolean isMember(Player player) - Checks if player is member
    IArena getArena() - Gets team's arena
    List<Player> getMembers() - Gets alive team members
    void defaultSword(Player p, boolean value) - Restores/removes default sword
    Location getBed() - Gets bed location
    ConcurrentHashMap<String, Integer> getTeamUpgradeTiers() - Gets upgrade tiers
    List<TeamEnchant> getBowsEnchantments() - Gets bow enchantments
    List<TeamEnchant> getSwordsEnchantments() - Gets sword enchantments
    List<TeamEnchant> getArmorsEnchantments() - Gets armor enchantments
    int getSize() - Gets current team size
    void addPlayers(Player... players) - Adds members to team
    void firstSpawn(Player p) - Spawns player for first time
    void spawnNPCs() - Spawns shopkeepers
    void reJoin(Player p) - Rejoins team
    void reJoin(Player p, int respawnTime) - Rejoins team with respawn time
    void sendDefaultInventory(Player p, boolean clear) - Gives start inventory
    void respawnMember(Player p) - Respawns member after countdown
    void sendArmor(Player p) - Equips default armor
    void addTeamEffect(PotionEffectType pef, int amp, int duration) - Adds team effect
    void addBaseEffect(PotionEffectType pef, int amp, int duration) - Adds base effect
    List<PotionEffect> getBaseEffects() - Gets base effects
    void addBowEnchantment(Enchantment e, int a) - Adds bow enchantment
    void addSwordEnchantment(Enchantment e, int a) - Adds sword enchantment
    void addArmorEnchantment(Enchantment e, int a) - Adds armor enchantment
    boolean wasMember(UUID u) - Checks if played in match
    boolean isBedDestroyed() - Checks if bed destroyed
    Location getSpawn() - Gets spawn location
    Location getShop() - Gets shop location
    Location getTeamUpgrades() - Gets upgrades location
    void setBedDestroyed(boolean bedDestroyed) - Sets bed destroyed status
    IGenerator getIronGenerator() - Gets iron generator (deprecated)
    IGenerator getGoldGenerator() - Gets gold generator (deprecated)
    IGenerator getEmeraldGenerator() - Gets emerald generator (deprecated)
    void setEmeraldGenerator(IGenerator emeraldGenerator) - Sets emerald generator (deprecated)
    List<IGenerator> getGenerators() - Gets team generators
    int getDragons() - Gets dragons amount
    void setDragons(int amount) - Sets dragons amount
    List<Player> getMembersCache() - Gets members cache (deprecated)
    void destroyData() - Destroys team data
    void destroyBedHolo(Player player) - Destroys bed hologram (deprecated)
    LinkedList<EnemyBaseEnterTrap> getActiveTraps() - Gets queued traps
    Vector getKillDropsLocation() - Gets kill drops location
    void setKillDropsLocation(Vector location) - Sets kill drops location
    boolean isBed(Location location) - Checks if bed at location
    void onBedDestroy(Location location) - Handles bed destruction
    
    
    VersionSupport abstract class: com.andrei1058.bedwars.api.server
    Description: Abstract class for version-specific NMS operations
    Constructor:
    
    VersionSupport(Plugin plugin, String versionName) - Creates version support handler
    
    Static Fields:
    
    static String PLUGIN_TAG_GENERIC_KEY - Generic NBT tag key ("BedWars1058")
    static String PLUGIN_TAG_TIER_KEY - Tier identifier key ("tierIdentifier")
    
    Instance Methods:
    
    Plugin getOwner() - Gets adapter owner plugin
    abstract void registerCommand(String name, Command clasa) - Registers bukkit command
    abstract void sendTitle(Player p, String title, String subtitle, int fadeIn, int stay, int fadeOut) - Sends title
    abstract void playAction(Player p, String text) - Sends action bar message
    abstract boolean isBukkitCommandRegistered(String command) - Checks if command registered
    abstract ItemStack getItemInHand(Player p) - Gets item in hand
    abstract void hideEntity(Entity e, Player p) - Hides entity from player
    abstract boolean isArmor(ItemStack itemStack) - Checks if item is armor
    abstract boolean isTool(ItemStack itemStack) - Checks if item is tool
    abstract boolean isSword(ItemStack itemStack) - Checks if item is sword
    abstract boolean isAxe(ItemStack itemStack) - Checks if item is axe
    abstract boolean isBow(ItemStack itemStack) - Checks if item is bow
    abstract boolean isProjectile(ItemStack itemStack) - Checks if item is projectile
    abstract boolean isInvisibilityPotion(ItemStack itemStack) - Checks if invisibility potion
    boolean isGlass(Material type) - Checks if material is glass
    abstract void registerEntities() - Registers custom entities
    abstract void spawnShop(Location loc, String name1, List<Player> players, IArena arena) - Spawns shop NPC
    abstract double getDamage(ItemStack i) - Gets item damage
    abstract void spawnSilverfish(Location loc, ITeam team, double speed, double health, int despawn, double damage) - Spawns silverfish
    abstract void spawnIronGolem(Location loc, ITeam team, double speed, double health, int despawn) - Spawns iron golem
    boolean isDespawnable(Entity e) - Checks if entity is despawnable
    abstract void minusAmount(Player p, ItemStack i, int amount) - Reduces item amount
    abstract void setSource(TNTPrimed tnt, Player owner) - Sets TNT source
    abstract void voidKill(Player p) - Void damage with cause
    abstract void hideArmor(Player victim, Player receiver) - Hides armor from player
    abstract void showArmor(Player victim, Player receiver) - Shows armor to player
    abstract void spawnDragon(Location l, ITeam team) - Spawns ender dragon
    abstract void colorBed(ITeam team) - Colors bed (1.12+)
    abstract void registerTntWhitelist(float endStoneBlast, float glassBlast) - Modifies blast resistance
    Effect eggBridge() - Gets egg bridge effect
    void setEggBridgeEffect(String eggBridge) - Sets egg bridge effect
    abstract void setBlockTeamColor(Block block, TeamColor teamColor) - Sets block team color
    abstract void setCollide(Player p, IArena a, boolean value) - Disables collisions (1.9+)
    abstract ItemStack addCustomData(ItemStack i, String data) - Adds custom NBT data
    abstract ItemStack setTag(ItemStack itemStack, String key, String value) - Sets NBT tag
    abstract String getTag(ItemStack itemStack, String key) - Gets NBT tag
    abstract boolean isCustomBedWarsItem(ItemStack i) - Checks if has BedWars NBT
    abstract String getCustomData(ItemStack i) - Gets NBT tag data
    abstract ItemStack colourItem(ItemStack itemStack, ITeam bedWarsTeam) - Colors item
    abstract ItemStack createItemStack(String material, int amount, short data) - Creates item stack
    boolean isPlayerHead(String material, int data) - Checks if player head
    abstract Material materialFireball() - Gets fireball material
    abstract Material materialPlayerHead() - Gets player head material
    abstract Material materialSnowball() - Gets snowball material
    abstract Material materialGoldenHelmet() - Gets gold helmet material
    abstract Material materialGoldenChestPlate() - Gets gold chestplate material
    abstract Material materialGoldenLeggings() - Gets gold leggings material
    abstract Material materialNetheriteHelmet() - Gets netherite helmet material
    abstract Material materialNetheriteChestPlate() - Gets netherite chestplate material
    abstract Material materialNetheriteLeggings() - Gets netherite leggings material
    abstract Material materialElytra() - Gets elytra material
    abstract Material materialCake() - Gets cake material
    abstract Material materialCraftingTable() - Gets crafting table material
    abstract Material materialEnchantingTable() - Gets enchanting table material
    boolean isBed(Material material) - Checks if bed
    boolean itemStackDataCompare(ItemStack i, short data) - Compares item data
    void setJoinSignBackgroundBlockData(BlockState b, byte data) - Sets sign background data
    abstract void setJoinSignBackground(BlockState b, Material material) - Sets sign background
    abstract Material woolMaterial() - Gets wool material
    abstract String getShopUpgradeIdentifier(ItemStack itemStack) - Gets upgrade identifier
    abstract ItemStack setShopUpgradeIdentifier(ItemStack itemStack, String identifier) - Sets upgrade identifier
    abstract ItemStack getPlayerHead(Player player, ItemStack copyTagFrom) - Gets player head with skin
    abstract void sendPlayerSpawnPackets(Player player, IArena arena) - Sends spawn packets
    abstract String getInventoryName(InventoryEvent e) - Gets inventory name
    abstract void setUnbreakable(ItemMeta itemMeta) - Makes item unbreakable
    ConcurrentHashMap<UUID, Despawnable> getDespawnablesList() - Gets despawnables list
    static String getName() - Gets version name
    abstract int getVersion() - Gets version number
    Plugin getPlugin() - Gets owner plugin
    abstract void registerVersionListeners() - Registers version listeners
    abstract String getMainLevel() - Gets main level name
    byte getCompressedAngle(float value) - Compresses angle to byte
    void spigotShowPlayer(Player victim, Player receiver) - Shows player (Spigot)
    void spigotHidePlayer(Player victim, Player receiver) - Hides player (Spigot)
    abstract Fireball setFireballDirection(Fireball fireball, Vector vector) - Sets fireball direction
    abstract void playRedStoneDot(Player player) - Plays redstone particle
    abstract void clearArrowsFromPlayerBody(Player player) - Clears arrows from player
    abstract void placeTowerBlocks(Block b, IArena a, TeamColor color, int x, int y, int z) - Places tower blocks
    abstract void placeLadder(Block b, int x, int y, int z, IArena a, int ladderdata) - Places ladder
    abstract void playVillagerEffect(Player player, Location location) - Plays villager effect
    
    
    Language class: com.andrei1058.bedwars.api.language
    Description: Manages language files and player language preferences
    Constructor:
    
    Language(Plugin plugin, String iso) - Creates language handler
    
    Instance Methods:
    
    void setPrefix(String prefix) - Sets chat prefix
    void setPrefixStatic(String prefix) - Sets static prefix
    String getLangName() - Gets language display name
    boolean exists(String path) - Checks if message path exists
    void relocate(String from, String to) - Moves config value
    String m(String path) - Gets color translated message
    List<String> l(String path) - Gets color translated list
    String getIso() - Gets language ISO code
    void setupUnSetCategories() - Creates messages for new shop categories
    YamlConfiguration getYml() - Gets YAML configuration
    
    Static Methods:
    
    List<String> getScoreboard(Player player, String path, String alternative) - Gets scoreboard strings
    String getMsg(Player player, String path) - Gets message in player's language
    Language getPlayerLanguage(Player player) - Retrieves player language
    Language getPlayerLanguage(UUID p) - Retrieves player language by UUID
    List<String> getList(Player player, String path) - Gets string list in player's language
    void saveIfNotExists(String path, Object data) - Saves value if not exists
    HashMap<UUID, Language> getLangByPlayer() - Gets language by player map
    boolean isLanguageExist(String iso) - Checks if language exists
    Language getLang(String iso) - Gets language by ISO
    List<Language> getLanguages() - Gets loaded languages
    void setupCustomStatsMessages() - Saves messages for stats items
    void addDefaultMessagesCommandItems(Language language) - Adds default item messages
    void addCategoryMessages(YamlConfiguration yml, String categoryName, String invName, String itemName, List<String> itemLore) - Adds category messages
    void addContentMessages(YamlConfiguration yml, String contentName, String categoryName, String itemName, List<String> itemLore) - Adds content messages
    boolean setPlayerLanguage(UUID uuid, String iso) - Changes player language
    String[] getCountDownTitle(Language playerLang, int second) - Gets countdown title/subtitle
    void setDefaultLanguage(Language defaultLanguage) - Sets server default language
    Language getDefaultLanguage() - Gets server default language
    
    
    RestoreAdapter abstract class: com.andrei1058.bedwars.api.server
    Description: Abstract class for world restoration/management
    Constructor:
    
    RestoreAdapter(Plugin owner) - Creates restore adapter
    
    Instance Methods:
    
    Plugin getOwner() - Gets adapter owner
    abstract void onEnable(IArena a) - Loads world for arena
    abstract void onRestart(IArena a) - Restores world
    abstract void onDisable(IArena a) - Unloads world
    abstract void onSetupSessionStart(ISetupSession s) - Loads world for setup
    abstract void onSetupSessionClose(ISetupSession s) - Unloads setup world
    void onLobbyRemoval(IArena a) - Removes lobby blocks
    abstract boolean isWorld(String name) - Checks if world exists
    abstract void deleteWorld(String name) - Deletes world
    abstract void cloneArena(String name1, String name2) - Clones arena world
    abstract List<String> getWorldsList() - Gets world container
    abstract void convertWorlds() - Converts worlds if necessary
    abstract String getDisplayName() - Gets adapter display name
    void foreachBlockInRegion(Location corner1, Location corner2, Consumer<Block> consumer) - Iterates blocks in region
    void clearItems(World world) - Clears item entities
    
    
    ConfigManager class: com.andrei1058.bedwars.api.configuration
    Description: Configuration file manager
    Constructor:
    
    ConfigManager(Plugin plugin, String name, String dir) - Creates configuration manager
    
    Instance Methods:
    
    void reload() - Reloads configuration
    String stringLocationArenaFormat(Location loc) - Converts location to arena format
    String stringLocationConfigFormat(Location loc) - Converts location to config format
    void saveConfigLoc(String path, Location loc) - Saves general location
    void saveArenaLoc(String path, Location loc) - Saves arena location
    Location getConfigLoc(String path) - Gets general location
    Location getArenaLoc(String path) - Gets arena location
    Location convertStringToArenaLocation(String string) - Converts string to arena location
    List<Location> getArenaLocations(String path) - Gets list of arena locations
    void set(String path, Object value) - Sets config value
    YamlConfiguration getYml() - Gets YAML instance
    void save() - Saves config to file
    List<String> getList(String path) - Gets string list with colors
    boolean getBoolean(String path) - Gets boolean value
    int getInt(String path) - Gets integer value
    double getDouble(String path) - Gets double value
    String getString(String path) - Gets string value
    boolean isFirstTime() - Checks if config created first time
    boolean compareArenaLoc(Location l1, Location l2) - Compares arena locations
    String getName() - Gets config name
    void setName(String name) - Sets internal name
    
    IGenerator interface: com.andrei1058.bedwars.api.arena.generator
    Description: Interface for resource generators
    Instance Methods:
    
    HashMap<String, IGenHolo> getLanguageHolograms() - Gets holograms by language
    void disable() - Disables generator and destroys data
    void upgrade() - Upgrades generator
    void spawn() - Attempts to spawn items every second
    void dropItem(Location location) - Drops item at location
    void setOre(ItemStack ore) - Sets spawn item
    IArena getArena() - Gets assigned arena
    void rotate() - Manages block rotation (called every tick)
    void setDelay(int delay) - Sets spawn delay in seconds
    void setAmount(int amount) - Sets spawn amount
    Location getLocation() - Gets generator location
    ItemStack getOre() - Gets generator ore
    void updateHolograms(Player p, String iso) - Hides holograms with different language
    void enableRotation() - Enables generator rotation
    void setSpawnLimit(int value) - Sets spawn limit
    ITeam getBwt() - Gets assigned team (null if not team generator)
    ArmorStand getHologramHolder() - Gets hologram holder armor stand
    GeneratorType getType() - Gets generator type
    int getAmount() - Gets items dropped per spawn
    int getDelay() - Gets spawn delay
    int getNextSpawn() - Gets seconds until next spawn
    int getSpawnLimit() - Gets spawn limit
    void setNextSpawn(int nextSpawn) - Sets time until next spawn
    void setStack(boolean stack) - Sets if items stack
    boolean isStack() - Checks if items stack
    void setType(GeneratorType type) - Sets generator type
    void destroyData() - Destroys generator data
    
    
    TeamColor enum: com.andrei1058.bedwars.api.arena.team
    Description: Enum for team colors with utility methods
    Enum Values:
    
    RED, BLUE, GREEN, YELLOW, AQUA, WHITE, PINK, GRAY, DARK_GREEN, DARK_GRAY
    
    Instance Methods:
    
    ChatColor chat() - Gets chat color for this team color
    DyeColor dye() - Gets dye color for this team color
    byte itemByte() - Gets byte color for MC 1.12 and older
    Color bukkitColor() - Gets Color for leather armor
    Material bedMaterial() - Gets bed material (1.13+)
    Material glassMaterial() - Gets glass material (1.13+)
    Material glassPaneMaterial() - Gets glass pane material (1.13+)
    Material glazedTerracottaMaterial() - Gets glazed terracotta material (1.13+)
    Material woolMaterial() - Gets wool material (1.13+)
    
    Static Methods:
    
    static ChatColor getChatColor(String tColor) - Gets chat color by team color string
    static ChatColor getChatColor(TeamColor teamColor) - Gets chat color (deprecated)
    static DyeColor getDyeColor(String teamColor) - Gets dye color (deprecated)
    static byte itemColor(TeamColor teamColor) - Gets byte color (deprecated)
    static String enName(String material) - Gets English color name from material
    static String enName(byte b) - Gets English color name from byte
    static Color getColor(TeamColor teamColor) - Gets Color (deprecated)
    static Material getBedBlock(TeamColor teamColor) - Gets bed material (deprecated)
    static Material getGlass(TeamColor teamColor) - Gets glass material (deprecated)
    static Material getGlassPane(TeamColor teamColor) - Gets glass pane (deprecated)
    static Material getGlazedTerracotta(TeamColor teamColor) - Gets terracotta (deprecated)
    static Material getWool(TeamColor teamColor) - Gets wool (deprecated)
    
    
    Despawnable class: com.andrei1058.bedwars.api.entity
    Description: Entity that despawns after a timer
    Constructor:
    
    Despawnable(LivingEntity e, ITeam team, int despawn, String namePath, PlayerKillCause deathFinalCause, PlayerKillCause deathRegularCause) - Creates despawnable entity
    
    Instance Methods:
    
    void refresh() - Updates entity (called every tick)
    LivingEntity getEntity() - Gets living entity
    ITeam getTeam() - Gets owner team
    int getDespawn() - Gets remaining despawn time
    PlayerKillCause getDeathFinalCause() - Gets final kill cause
    PlayerKillCause getDeathRegularCause() - Gets regular kill cause
    void destroy() - Destroys entity immediately
    boolean equals(Object obj) - Checks equality
    
    
    BlockRay class: com.andrei1058.bedwars.api.util
    Description: Iterator for tracing blocks between two vectors
    Constructor:
    
    BlockRay(World world, Vector src, Vector dst, double step) - Creates block ray tracer
    
    Instance Methods:
    
    boolean hasNext() - Checks if has next block
    Block next() - Gets next block (can return same block multiple times)
    
    
    SubCommand abstract class: com.andrei1058.bedwars.api.command
    Description: Abstract class for sub-commands
    Constructor:
    
    SubCommand(ParentCommand parent, String name) - Creates sub-command
    
    Instance Methods:
    
    abstract boolean execute(String[] args, CommandSender s) - Executes sub-command
    String getSubCommandName() - Gets sub-command name
    void showInList(boolean value) - Sets if displayed in main command
    void setDisplayInfo(TextComponent displayInfo) - Sets command info
    void setPriority(int priority) - Sets display priority
    ParentCommand getParent() - Gets parent command
    int getPriority() - Gets priority
    TextComponent getDisplayInfo() - Gets command description
    void setArenaSetupCommand(boolean arenaSetupCommand) - Sets as arena setup command
    boolean isArenaSetupCommand() - Checks if arena setup command
    boolean isShow() - Checks if displayed in list
    void setPermission(String permission) - Sets permission
    boolean hasPermission(CommandSender p) - Checks permission
    boolean canSee(CommandSender sender, BedWars api) - Checks if sender can see command
    abstract List<String> getTabComplete() - Gets tab complete options
    
    
    Messages class: com.andrei1058.bedwars.api.language
    Description: Constants for message paths in language files
    Static Fields (Selected):
    
    static String PREFIX - Prefix path
    static String COMMAND_MAIN - Main command list
    static String COMMAND_JOIN_USAGE - Join command usage
    static String ARENA_STATUS_WAITING_NAME - Waiting status name
    static String ARENA_STATUS_PLAYING_NAME - Playing status name
    static String PLAYER_DIE_RESPAWN_TITLE - Respawn title
    static String GAME_END_VICTORY_PLAYER_TITLE - Victory title
    static String SHOP_NEW_PURCHASE - Shop purchase message
    And many more message path constants...
    
    
    ConfigPath class: com.andrei1058.bedwars.api.configuration
    Description: Constants for configuration paths
    Static Fields (Selected):
    
    static String GENERAL_CONFIGURATION_BUNGEE_MODE_GAMES_BEFORE_RESTART - Games before restart
    static String GENERAL_CONFIGURATION_START_COUNTDOWN_REGULAR - Start countdown time
    static String ARENA_WAITING_POS1 - Waiting area position 1
    static String ARENA_SPAWN_PROTECTION - Spawn protection radius
    static String SHOP_SETTINGS_PATH - Shop settings path
    static String GENERATOR_IRON_DELAY - Iron generator delay
    And many more configuration path constants...
    
    
    Party interface: com.andrei1058.bedwars.api.party
    Description: Interface for party system
    Instance Methods:
    
    boolean hasParty(Player p) - Checks if player has party
    int partySize(Player p) - Gets party size
    boolean isOwner(Player p) - Checks if player is owner
    List<Player> getMembers(Player owner) - Gets party members
    void createParty(Player owner, Player... members) - Creates party
    void addMember(Player owner, Player member) - Adds member
    void removeFromParty(Player member) - Removes member
    void disband(Player owner) - Disbands party
    boolean isMember(Player owner, Player check) - Checks if member
    void removePlayer(Player owner, Player target) - Removes player
    Player getOwner(Player member) - Gets party owner
    void promote(Player owner, Player target) - Promotes member to owner
    boolean isInternal() - Checks if internal party system
    
    
    Level interface: com.andrei1058.bedwars.api.levels
    Description: Interface for level system
    Instance Methods:
    
    String getLevel(Player p) - Gets current level formatted
    int getPlayerLevel(Player p) - Gets current level as number
    String getRequiredXpFormatted(Player p) - Gets required XP formatted
    String getProgressBar(Player p) - Gets current progress bar
    int getCurrentXp(Player p) - Gets current XP
    String getCurrentXpFormatted(Player p) - Gets current XP formatted
    int getRequiredXp(Player p) - Gets required XP
    void addXp(Player player, int xp, PlayerXpGainEvent.XpSource source) - Adds XP
    void setXp(Player player, int currentXp) - Sets player XP
    void setLevel(Player player, int level) - Sets player level
    
    
    ISetupSession interface: com.andrei1058.bedwars.api.server
    Description: Interface for arena setup session
    Instance Methods:
    
    String getWorldName() - Gets world name
    Player getPlayer() - Gets player doing setup
    SetupType getSetupType() - Gets setup type
    ConfigManager getConfig() - Gets arena config
    void teleportPlayer() - Teleports player to world
    void close() - Closes setup session
    
    
    Region interface: com.andrei1058.bedwars.api.region
    Description: Interface for protected regions
    Instance Methods:
    
    boolean isInRegion(Location location) - Checks if location in region
    boolean isProtected() - Checks if protected region
    
    
    Cuboid class: com.andrei1058.bedwars.api.region
    Description: Cuboid region implementation
    Constructor:
    
    Cuboid(Location loc, int radius, boolean protect) - Creates cuboid region
    
    Instance Methods:
    
    boolean isInRegion(Location l) - Checks if location in region
    boolean isProtected() - Checks if protected
    void setMaxY(int maxY) - Sets maximum Y
    void setMinY(int minY) - Sets minimum Y
    void setProtect(boolean protect) - Sets protection
    int getMaxY() - Gets maximum Y
    int getMinY() - Gets minimum Y
    
    
    GameState enum: com.andrei1058.bedwars.api.arena
    Description: Arena game states
    Enum Values:
    
    waiting - Waiting for players
    starting - Countdown started
    playing - Game in progress
    restarting - Game ended, restarting
    
    
    NextEvent enum: com.andrei1058.bedwars.api.arena
    Description: Next scheduled events
    Enum Values:
    
    DIAMOND_GENERATOR_TIER_II - Diamond upgrade tier 2
    DIAMOND_GENERATOR_TIER_III - Diamond upgrade tier 3
    EMERALD_GENERATOR_TIER_II - Emerald upgrade tier 2
    EMERALD_GENERATOR_TIER_III - Emerald upgrade tier 3
    BEDS_DESTROY - Beds destruction phase
    ENDER_DRAGON - Dragon spawn
    GAME_END - Game end
    
    Instance Methods:
    
    String getSoundPath() - Gets sound path for event
    
    
    ServerType enum: com.andrei1058.bedwars.api.server
    Description: Server configuration types
    Enum Values:
    
    BUNGEE - BungeeCord mode (one arena per server)
    MULTIARENA - Multiple arenas on one server
    SHARED - Shared lobby with arenas
    
    
    GeneratorType enum: com.andrei1058.bedwars.api.arena.generator
    Description: Generator types
    Enum Values:
    
    IRON - Iron generator
    GOLD - Gold generator
    EMERALD - Emerald generator
    DIAMOND - Diamond generator
    CUSTOM - Custom generator
    
    
    ISidebar interface: com.andrei1058.bedwars.api.sidebar
    Description: Interface for player sidebar
    Instance Methods:
    
    Player getPlayer() - Gets sidebar holder
    IArena getArena() - Gets arena (can be null)
    Sidebar getHandle() - Gets sidebar library handle
    void setContent(List<String> titleArray, List<String> lineArray, IArena arena) - Sets sidebar content
    SidebarLine normalizeTitle(List<String> titleArray) - Converts animated string to object
    List<SidebarLine> normalizeLines(List<String> lineArray) - Converts string lines to objects
    void giveUpdateTabFormat(Player player, boolean skipStateCheck, Boolean spectator) - Updates tab format for player
    void giveUpdateTabFormat(Player player, boolean skipStateCheck) - Updates tab format for player
    boolean isTabFormattingDisabled() - Checks if tab formatting disabled (deprecated)
    boolean registerPersistentPlaceholder(PlaceholderProvider placeholderProvider) - Registers persistent placeholder
    
    
    ISidebarService interface: com.andrei1058.bedwars.api.sidebar
    Description: BedWars scoreboard manager
    Instance Methods:
    
    void giveSidebar(Player player, IArena arena, boolean delay) - Sends player scoreboard
    void remove(Player player) - Removes player scoreboard
    void refreshTitles() - Refreshes titles on all scoreboards
    void refreshPlaceholders() - Refreshes placeholders on all sidebars
    void refreshPlaceholders(IArena arena) - Refreshes placeholders for arena
    void refreshTabList() - Refreshes tab list headers/footers
    void refreshHealth() - Refreshes player healths
    ISidebar getSidebar(Player player) - Gets player's sidebar
    
    PlayerKillEvent class: com.andrei1058.bedwars.api.events.player
    Description: Called when a player is killed during the game
    Constructors:
    
    PlayerKillEvent(IArena arena, Player victim, Player killer, Function<Player, String> message, PlayerKillCause cause) - Deprecated constructor
    PlayerKillEvent(IArena arena, Player victim, ITeam victimTeam, Player killer, ITeam killerTeam, Function<Player, String> message, PlayerKillCause cause) - Full constructor
    
    Instance Methods (Getters):
    
    Player getKiller() - Gets killer (can be null)
    Function<Player, String> getMessage() - Gets kill chat message
    PlayerKillCause getCause() - Gets kill cause
    IArena getArena() - Gets arena
    Player getVictim() - Gets victim player
    boolean playSound() - Checks if killer gets kill sound
    ITeam getKillerTeam() - Gets killer's team
    ITeam getVictimTeam() - Gets victim's team
    HandlerList getHandlers() - Gets handler list
    
    Instance Methods (Setters):
    
    void setMessage(Function<Player, String> message) - Sets chat message
    void setPlaySound(boolean playSound) - Sets if killer should get sound
    void setKillerTeam(ITeam killerTeam) - Sets killer team
    void setVictimTeam(ITeam victimTeam) - Sets victim team
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    Inner Enum: PlayerKillCause
    Values and methods:
    
    UNKNOWN(false, false, false)
    UNKNOWN_FINAL_KILL(true, false, false)
    EXPLOSION(false, false, false)
    EXPLOSION_FINAL_KILL(true, false, false)
    VOID(false, false, false)
    VOID_FINAL_KILL(true, false, false)
    PVP(false, false, false)
    PVP_FINAL_KILL(true, false, false)
    PLAYER_SHOOT(false, false, false)
    PLAYER_SHOOT_FINAL_KILL(true, false, false)
    SILVERFISH(false, true, false)
    SILVERFISH_FINAL_KILL(true, true, false)
    IRON_GOLEM(false, true, false)
    IRON_GOLEM_FINAL_KILL(true, true, false)
    PLAYER_PUSH(false, false, false)
    PLAYER_PUSH_FINAL(true, false, false)
    PLAYER_DISCONNECT(false, false, true)
    PLAYER_DISCONNECT_FINAL(true, false, true)
    
    Methods: boolean isFinalKill(), boolean isDespawnable(), boolean isPvpLogOut()
    
    PlayerAfkEvent class: com.andrei1058.bedwars.api.events.player
    Description: Called when player goes AFK or comes back from AFK
    Constructor:
    
    PlayerAfkEvent(Player player, AFKType afkType) - Creates event
    
    Instance Methods (Getters):
    
    Player getPlayer() - Gets player
    AFKType getAfkType() - Gets AFK type (START/END)
    HandlerList getHandlers() - Gets handler list
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    Inner Enum: AFKType
    
    START - When player goes AFK
    END - When player comes back from AFK
    
    
    PlayerBaseEnterEvent class: com.andrei1058.bedwars.api.events.player
    Description: Called when player enters a team base
    Constructor:
    
    PlayerBaseEnterEvent(Player p, ITeam team) - Creates event
    
    Instance Methods (Getters):
    
    ITeam getTeam() - Gets team owning the entered base
    Player getPlayer() - Gets player who entered
    HandlerList getHandlers() - Gets handler list
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    PlayerBaseLeaveEvent class: com.andrei1058.bedwars.api.events.player
    Description: Called when player leaves a team base
    Constructor:
    
    PlayerBaseLeaveEvent(Player p, ITeam team) - Creates event
    
    Instance Methods (Getters):
    
    ITeam getTeam() - Gets team owning the exited base
    Player getPlayer() - Gets player who left
    HandlerList getHandlers() - Gets handler list
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    PlayerBedBreakEvent class: com.andrei1058.bedwars.api.events.player
    Description: Called when a bed is destroyed
    Constructor:
    
    PlayerBedBreakEvent(Player p, ITeam playerTeam, ITeam victimTeam, IArena arena, Function<Player, String> message, Function<Player, String> title, Function<Player, String> subTitle) - Creates event
    
    Instance Methods (Getters):
    
    ITeam getPlayerTeam() - Gets player's team
    ITeam getVictimTeam() - Gets team who got bed destroyed
    IArena getArena() - Gets arena
    Player getPlayer() - Gets player who broke bed
    Function<Player, String> getMessage() - Gets chat message
    Function<Player, String> getTitle() - Gets title
    Function<Player, String> getSubTitle() - Gets subtitle
    HandlerList getHandlers() - Gets handler list
    
    Instance Methods (Setters):
    
    void setMessage(Function<Player, String> message) - Sets chat message
    void setTitle(Function<Player, String> title) - Sets title
    void setSubTitle(Function<Player, String> subTitle) - Sets subtitle
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    PlayerBedBugSpawnEvent class: com.andrei1058.bedwars.api.events.player
    Description: Called when a bed bug (silverfish) is spawned
    Constructor:
    
    PlayerBedBugSpawnEvent(Player p, ITeam playerTeam, IArena arena) - Creates event
    
    Instance Methods (Getters):
    
    Player getPlayer() - Gets player who spawned bed bug
    IArena getArena() - Gets arena
    ITeam getPlayerTeam() - Gets player's team
    HandlerList getHandlers() - Gets handler list
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    PlayerDreamDefenderSpawnEvent class: com.andrei1058.bedwars.api.events.player
    Description: Called when a dream defender (iron golem) is spawned
    Constructor:
    
    PlayerDreamDefenderSpawnEvent(Player p, ITeam playerTeam, IArena arena) - Creates event
    
    Instance Methods (Getters):
    
    Player getPlayer() - Gets player who spawned defender
    IArena getArena() - Gets arena
    ITeam getPlayerTeam() - Gets player's team
    HandlerList getHandlers() - Gets handler list
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    PlayerFirstSpawnEvent class: com.andrei1058.bedwars.api.events.player
    Description: Called when member spawns for first time on their island
    Constructor:
    
    PlayerFirstSpawnEvent(Player player, IArena arena, ITeam team) - Creates event
    
    Instance Methods (Getters):
    
    IArena getArena() - Gets arena
    ITeam getTeam() - Gets player's team
    Player getPlayer() - Gets player
    HandlerList getHandlers() - Gets handler list
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    PlayerGeneratorCollectEvent class: com.andrei1058.bedwars.api.events.player
    Description: Triggered when players collect from generators
    Constructor:
    
    PlayerGeneratorCollectEvent(Player player, Item item, IArena arena) - Creates event
    
    Instance Methods (Getters):
    
    IArena getArena() - Gets arena
    Player getPlayer() - Gets player
    Item getItem() - Gets item entity
    ItemStack getItemStack() - Gets item stack
    boolean isCancelled() - Checks if cancelled
    HandlerList getHandlers() - Gets handler list
    
    Instance Methods (Setters):
    
    void setCancelled(boolean cancelled) - Cancels event
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    PlayerInvisibilityPotionEvent class: com.andrei1058.bedwars.api.events.player
    Description: Called when invisibility potions are managed by BedWars
    Constructor:
    
    PlayerInvisibilityPotionEvent(Type type, ITeam team, Player player, IArena arena) - Creates event
    
    Instance Methods (Getters):
    
    Type getType() - Gets type (ADDED/REMOVED)
    IArena getArena() - Gets arena
    Player getPlayer() - Gets player
    ITeam getTeam() - Gets team
    HandlerList getHandlers() - Gets handler list
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    Inner Enum: Type
    
    ADDED - Invisibility added
    REMOVED - Invisibility removed
    
    
    PlayerJoinArenaEvent class: com.andrei1058.bedwars.api.events.player
    Description: Called when player joins arena as player or spectator
    Constructor:
    
    PlayerJoinArenaEvent(IArena arena, Player p, boolean spectator) - Creates event
    
    Instance Methods (Getters):
    
    IArena getArena() - Gets arena
    Player getPlayer() - Gets player
    boolean isSpectator() - Checks if joined as spectator
    boolean isCancelled() - Checks if cancelled
    HandlerList getHandlers() - Gets handler list
    
    Instance Methods (Setters):
    
    void setCancelled(boolean cancelled) - Cancels event
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    PlayerLangChangeEvent class: com.andrei1058.bedwars.api.events.player
    Description: Called when player changes language
    Constructor:
    
    PlayerLangChangeEvent(Player p, String oldLang, String newLang) - Creates event
    
    Instance Methods (Getters):
    
    boolean isCancelled() - Checks if cancelled
    Player getPlayer() - Gets player
    String getOldLang() - Gets old language ISO
    String getNewLang() - Gets new language ISO
    HandlerList getHandlers() - Gets handler list
    
    Instance Methods (Setters):
    
    void setCancelled(boolean cancelled) - Cancels event
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    PlayerLeaveArenaEvent class: com.andrei1058.bedwars.api.events.player
    Description: Called when player leaves arena (also when arena ends)
    Constructors:
    
    PlayerLeaveArenaEvent(Player p, IArena arena, Player lastDamager) - Full constructor
    PlayerLeaveArenaEvent(Player p, IArena arena) - Deprecated constructor
    
    Instance Methods (Getters):
    
    Player getPlayer() - Gets player
    IArena getArena() - Gets arena
    boolean isSpectator() - Checks if was spectating
    Player getLastDamager() - Gets last damager (can be null)
    HandlerList getHandlers() - Gets handler list
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    PlayerLevelUpEvent class: com.andrei1058.bedwars.api.events.player
    Description: Called when player levels up
    Constructor:
    
    PlayerLevelUpEvent(Player player, int newLevel, int levelUpXp) - Creates event
    
    Instance Methods (Getters):
    
    Player getPlayer() - Gets player
    int getNewLevel() - Gets new level
    int getNewXpTarget() - Gets new XP target for next level
    HandlerList getHandlers() - Gets handler list
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    PlayerReJoinEvent class: com.andrei1058.bedwars.api.events.player
    Description: Called when player rejoins arena
    Constructor:
    
    PlayerReJoinEvent(Player player, IArena arena, int respawnTime) - Creates event
    
    Instance Methods (Getters):
    
    IArena getArena() - Gets arena
    Player getPlayer() - Gets player
    int getRespawnTime() - Gets respawn time in seconds
    boolean isCancelled() - Checks if cancelled
    HandlerList getHandlers() - Gets handler list
    
    Instance Methods (Setters):
    
    void setRespawnTime(int respawnTime) - Sets respawn time
    void setCancelled(boolean cancelled) - Cancels event
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    PlayerReSpawnEvent class: com.andrei1058.bedwars.api.events.player
    Description: Called when member respawns on island (after countdown)
    Constructor:
    
    PlayerReSpawnEvent(Player player, IArena arena, ITeam team) - Creates event
    
    Instance Methods (Getters):
    
    IArena getArena() - Gets arena
    ITeam getTeam() - Gets player's team
    Player getPlayer() - Gets player
    HandlerList getHandlers() - Gets handler list
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    PlayerXpGainEvent class: com.andrei1058.bedwars.api.events.player
    Description: Called when player receives XP
    Constructor:
    
    PlayerXpGainEvent(Player player, int amount, XpSource xpSource) - Creates event
    
    Instance Methods (Getters):
    
    Player getPlayer() - Gets player
    int getAmount() - Gets XP amount
    XpSource getXpSource() - Gets XP source
    HandlerList getHandlers() - Gets handler list
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    Inner Enum: XpSource
    
    PER_MINUTE - XP per minute played
    PER_TEAMMATE - XP per teammate
    GAME_WIN - XP for winning
    BED_DESTROYED - XP for destroying bed
    FINAL_KILL - XP for final kill
    REGULAR_KILL - XP for regular kill
    OTHER - Other source
    
    
    EggBridgeBuildEvent class: com.andrei1058.bedwars.api.events.gameplay
    Description: Called when egg bridge builds another block
    Constructor:
    
    EggBridgeBuildEvent(TeamColor teamColor, IArena arena, Block block) - Creates event
    
    Instance Methods (Getters):
    
    IArena getArena() - Gets arena
    Block getBlock() - Gets built block
    TeamColor getTeamColor() - Gets block's team color
    HandlerList getHandlers() - Gets handler list
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    EggBridgeThrowEvent class: com.andrei1058.bedwars.api.events.gameplay
    Description: Called when player throws egg bridge
    Constructor:
    
    EggBridgeThrowEvent(Player player, IArena arena) - Creates event
    
    Instance Methods (Getters):
    
    Player getPlayer() - Gets player
    IArena getArena() - Gets arena
    boolean isCancelled() - Checks if cancelled
    HandlerList getHandlers() - Gets handler list
    
    Instance Methods (Setters):
    
    void setCancelled(boolean cancelled) - Cancels event
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    GameEndEvent class: com.andrei1058.bedwars.api.events.gameplay
    Description: Triggered when game ends
    Constructor:
    
    GameEndEvent(IArena arena, List<UUID> winners, List<UUID> losers, ITeam teamWinner, List<UUID> aliveWinners) - Creates event
    
    Instance Methods (Getters):
    
    List<UUID> getWinners() - Gets all winners (including eliminated teammates)
    ITeam getTeamWinner() - Gets winner team
    List<UUID> getLosers() - Gets losers
    IArena getArena() - Gets arena
    List<UUID> getAliveWinners() - Gets alive winners only
    HandlerList getHandlers() - Gets handler list
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    GameStateChangeEvent class: com.andrei1058.bedwars.api.events.gameplay
    Description: Called when arena status changes
    Constructor:
    
    GameStateChangeEvent(IArena a, GameState oldState, GameState newState) - Creates event
    
    Instance Methods (Getters):
    
    IArena getArena() - Gets arena
    GameState getOldState() - Gets old state
    GameState getNewState() - Gets new state
    HandlerList getHandlers() - Gets handler list
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    GeneratorUpgradeEvent class: com.andrei1058.bedwars.api.events.gameplay
    Description: Called when generator is upgraded
    Constructor:
    
    GeneratorUpgradeEvent(IGenerator generator) - Creates event
    
    Instance Methods (Getters):
    
    IGenerator getGenerator() - Gets generator
    HandlerList getHandlers() - Gets handler list
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    NextEventChangeEvent class: com.andrei1058.bedwars.api.events.gameplay
    Description: Called when next event changes
    Constructor:
    
    NextEventChangeEvent(IArena arena, NextEvent newEvent, NextEvent oldEvent) - Creates event
    
    Instance Methods (Getters):
    
    IArena getArena() - Gets arena
    NextEvent getNewEvent() - Gets upcoming event
    NextEvent getOldEvent() - Gets event that just happened
    HandlerList getHandlers() - Gets handler list
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    TeamAssignEvent class: com.andrei1058.bedwars.api.events.gameplay
    Description: Called when player is assigned to team (when countdown reaches 0)
    Constructor:
    
    TeamAssignEvent(Player player, ITeam team, IArena arena) - Creates event
    
    Instance Methods (Getters):
    
    ITeam getTeam() - Gets assigned team
    Player getPlayer() - Gets player
    IArena getArena() - Gets arena
    boolean isCancelled() - Checks if cancelled
    HandlerList getHandlers() - Gets handler list
    
    Instance Methods (Setters):
    
    void setCancelled(boolean cancelled) - Cancels event
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    ArenaDisableEvent class: com.andrei1058.bedwars.api.events.server
    Description: Called when arena is disabled
    Constructor:
    
    ArenaDisableEvent(String arenaName, String worldName) - Creates event
    
    Instance Methods (Getters):
    
    String getArenaName() - Gets arena name
    String getWorldName() - Gets world name
    HandlerList getHandlers() - Gets handler list
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    ArenaRestartEvent class: com.andrei1058.bedwars.api.events.server
    Description: Called when arena is restarting (after world unload)
    Constructor:
    
    ArenaRestartEvent(String arena, String worldName) - Creates event
    
    Instance Methods (Getters):
    
    String getArenaName() - Gets arena name
    String getWorldName() - Gets world name
    HandlerList getHandlers() - Gets handler list
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    SetupSessionStartEvent class: com.andrei1058.bedwars.api.events.server
    Description: Called when owner starts setting up arena
    Constructor:
    
    SetupSessionStartEvent(ISetupSession setupSession) - Creates event
    
    Instance Methods (Getters):
    
    ISetupSession getSetupSession() - Gets setup session
    HandlerList getHandlers() - Gets handler list
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    ShopBuyEvent class: com.andrei1058.bedwars.api.events.shop
    Description: Triggered when player buys from shop
    Constructors:
    
    ShopBuyEvent(Player buyer, ICategoryContent categoryContent) - Deprecated constructor
    ShopBuyEvent(Player buyer, IArena arena, ICategoryContent categoryContent) - Full constructor
    
    Implements: Cancellable
    Instance Methods (Getters):
    
    IArena getArena() - Gets arena
    Player getBuyer() - Gets buyer
    ICategoryContent getCategoryContent() - Gets shop content bought
    boolean isCancelled() - Checks if cancelled
    HandlerList getHandlers() - Gets handler list
    
    Instance Methods (Setters):
    
    void setCancelled(boolean cancelled) - Cancels event
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    ShopOpenEvent class: com.andrei1058.bedwars.api.events.shop
    Description: Triggered when shop NPC is clicked
    Constructors:
    
    ShopOpenEvent(Player player) - Deprecated constructor
    ShopOpenEvent(Player player, IArena arena) - Full constructor
    
    Instance Methods (Getters):
    
    IArena getArena() - Gets arena
    Player getPlayer() - Gets player who opened shop
    boolean isCancelled() - Checks if cancelled
    HandlerList getHandlers() - Gets handler list
    
    Instance Methods (Setters):
    
    void setCancelled(boolean cancelled) - Cancels event
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    PlayerSidebarInitEvent class: com.andrei1058.bedwars.api.events.sidebar
    Description: Called when player sidebar is initialized
    Constructor:
    
    PlayerSidebarInitEvent(Player player, ISidebar sidebar) - Creates event
    
    Implements: Cancellable
    Instance Methods (Getters):
    
    Player getPlayer() - Gets player
    ISidebar getSidebar() - Gets sidebar
    boolean isCancelled() - Checks if cancelled
    HandlerList getHandlers() - Gets handler list
    
    Instance Methods (Setters):
    
    void setPlayer(Player player) - Sets player
    void setSidebar(ISidebar sidebar) - Sets sidebar
    void setCancelled(boolean cancel) - Cancels event
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    SpectatorFirstPersonEnterEvent class: com.andrei1058.bedwars.api.events.spectator
    Description: Called when spectator enters first person spectating
    Constructor:
    
    SpectatorFirstPersonEnterEvent(Player spectator, Player target, IArena arena, Function<Player, String> title, Function<Player, String> subtitle) - Creates event
    
    Implements: Cancellable
    Instance Methods (Getters):
    
    Player getSpectator() - Gets spectator
    IArena getArena() - Gets arena
    Player getTarget() - Gets target player
    boolean isCancelled() - Checks if cancelled
    Function<Player, String> getSubTitle() - Gets subtitle
    Function<Player, String> getTitle() - Gets title
    int getStay() - Gets stay time
    int getFadeOut() - Gets fade out time
    int getFadeIn() - Gets fade in time
    HandlerList getHandlers() - Gets handler list
    
    Instance Methods (Setters):
    
    void setCancelled(boolean cancelled) - Cancels event
    void setTitle(Function<Player, String> title) - Sets title
    void setSubTitle(Function<Player, String> subTitle) - Sets subtitle
    void setStay(int stay) - Sets stay time
    void setFadeOut(int fadeOut) - Sets fade out time
    void setFadeIn(int fadeIn) - Sets fade in time
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    SpectatorFirstPersonLeaveEvent class: com.andrei1058.bedwars.api.events.spectator
    Description: Called when spectator leaves first person spectating
    Constructor:
    
    SpectatorFirstPersonLeaveEvent(Player spectator, IArena arena, Function<Player, String> title, Function<Player, String> subtitle) - Creates event
    
    Instance Methods (Getters):
    
    Player getSpectator() - Gets spectator
    IArena getArena() - Gets arena
    Function<Player, String> getSubTitle() - Gets subtitle
    Function<Player, String> getTitle() - Gets title
    int getFadeIn() - Gets fade in time
    int getFadeOut() - Gets fade out time
    int getStay() - Gets stay time
    HandlerList getHandlers() - Gets handler list
    
    Instance Methods (Setters):
    
    void setSubTitle(Function<Player, String> subTitle) - Sets subtitle
    void setTitle(Function<Player, String> title) - Sets title
    void setFadeIn(int fadeIn) - Sets fade in time
    void setFadeOut(int fadeOut) - Sets fade out time
    void setStay(int stay) - Sets stay time
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    SpectatorTeleportToPlayerEvent class: com.andrei1058.bedwars.api.events.spectator
    Description: Called when spectator teleports to player
    Constructor:
    
    SpectatorTeleportToPlayerEvent(Player spectator, Player target, IArena arena) - Creates event
    
    Instance Methods (Getters):
    
    Player getSpectator() - Gets spectator
    IArena getArena() - Gets arena
    Player getTarget() - Gets target player
    boolean isCancelled() - Checks if cancelled
    HandlerList getHandlers() - Gets handler list
    
    Instance Methods (Setters):
    
    void setCancelled(boolean cancelled) - Cancels event
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    TeamEliminatedEvent class: com.andrei1058.bedwars.api.events.team
    Description: Called when all players on team are killed and bed is broken
    Constructor:
    
    TeamEliminatedEvent(IArena arena, ITeam team) - Creates event
    
    Instance Methods (Getters):
    
    IArena getArena() - Gets arena
    ITeam getTeam() - Gets eliminated team
    HandlerList getHandlers() - Gets handler list
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    
    
    UpgradeBuyEvent class: com.andrei1058.bedwars.api.events.upgrades
    Description: Called when team upgrade is bought
    Constructor:
    
    UpgradeBuyEvent(TeamUpgrade teamUpgrade, Player player, ITeam team) - Creates event
    
    Implements: Cancellable
    Instance Methods (Getters):
    
    IArena getArena() - Gets arena
    Player getPlayer() - Gets buyer
    ITeam getTeam() - Gets team
    TeamUpgrade getTeamUpgrade() - Gets upgrade
    boolean isCancelled() - Checks if cancelled
    HandlerList getHandlers() - Gets handler list
    
    Instance Methods (Setters):
    
    void setCancelled(boolean b) - Cancels event
    
    Static Methods:
    
    static HandlerList getHandlerList() - Gets static handler list
    `
};