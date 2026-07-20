module.exports = {
    name: 'EdPrison',
    description: 'EdPrison is the biggest Minecraft prison core ever created. API is mostly used to access their currencies or create custom enchants.',
    pluginId: 'EdPrison',
    mavenIntegration: `
        <repositories>
            <repository>
              <id>edlicense-repo</id>
              <url>https://repo.edlicense.com/repository/maven-releases/</url>
            </repository>
        </repositories>
        <dependencies>
          <dependency>
              <groupId>com.edwardbelt</groupId>
              <artifactId>edprison</artifactId>
              <version>5.6</version>
              <scope>provided</scope>
          </dependency>
        </dependencies>
    `,
    usage: `
        com.edwardbelt.edprison.EdPrison
        Creating the EdPrison instance:
        EdPrison edPrison;
        if(getServer().getPluginManager().isPluginEnabled("EdPrison")) {
            edPrison = (EdPrison) Bukkit.getPluginManager().getPlugin("EdPrison");
        }
        
        To get ApiManager use edPrison.getApi();
        
        Create a custom enchantment:
        package your.package;

        import com.edwardbelt.edprison.enchantments.manager.obj.Enchantment;
        import org.bukkit.block.Block;
        import org.bukkit.entity.Player;
        
        public class EnchantExample extends Enchantment {
        
            public EnchantExample() {
                super(
                        "my-enchant", // The enchant ID of enchantments.yml
                        "BlockBreakEvent"  // The trigger event of the enchant. Available: BlockBreakEvent, EnchantTriggerEvent{enchant}, PlayerHoldPickaxe, PlayerUnHoldPickaxe
                );
            }
        
            /**
            *    The enchant function. You just need to put what the enchant will do. Do not check the enchant level, the enchant chance or anything.
            *    EdPrison will manage everything you just put how the enchant works here.
            **/
            @Override
            public void execute(Player player, Block block) {
                player.sendMessage("My custom enchant was triggered! " + getId());
            }
        }
        
        package your.package;
        
        import location.EnchantExample;
        public final class EdPrison extends JavaPlugin {
        
            @Override
            public void onEnable() {
                // Just create the instance on your onEnable() and it will 
                // automatically register.
                EnchantExample EnchantExample = new EnchantExample();
            }
        
        }

        Very Important, if you are asked to create an explosion always use UtilsModel.createSphereExplosion or UtilsModel.createNaturalExplosion preferably createSphereExplosion

        EdPrison API Documentation
        API Classes
        ApiManager class: com.edwardbelt.edprison.api
            Instance Methods
            EnchantModel getEnchantApi()
            LevelModel getLevelApi()
            EconomyModel getEconomyApi()
            UtilsModel getUtilsApi()
            AutosellModel getAutosellApi()
            GangModel getGangApi()
        AutosellModel class: com.edwardbelt.edprison.api.models
            Instance Methods
            HashMap<String, Double> getMaterialCurrencies(Material var1, UUID var2)
            boolean isMatSaleable(Material var1)
            void sellMaterial(UUID var1, Material var2, double var3)
            void sellMaterials(UUID var1, HashMap<Material, Double> var2)
            void addSummaryCurrency(UUID var1, String var2, double var3)
            void removeSummaryCurrency(UUID var1, String var2, double var3)
            double getSummaryCurrency(UUID var1, String var2)
            void sendSummary(UUID var1)
            void clearSummary(UUID var1)
        EconomyModel class: com.edwardbelt.edprison.api.models
            Instance Methods
            double getEco(UUID var1, String var2)
            void addEco(UUID var1, String var2, double var3)
            void removeEco(UUID var1, String var2, double var3)
            void setEco(UUID var1, String var2, double var3)
        EnchantModel class: com.edwardbelt.edprison.api.models
            Instance Methods
            double getLevel(UUID var1, String var2)
            void setLevel(UUID var1, String var2, double var3)
            void addLevel(UUID var1, String var2, double var3)
            void removeLevel(UUID var1, String var2, double var3)
            double getCostOfLevels(UUID var1, String var2, double var3)
            double getEnchantStartingCost(String var1)
            double getEnchantIncreaseCost(String var1)
            double getEnchantMaxLevel(String var1)
            String getEnchantCurrencyCost(String var1)
            List<String> getEnchantActions(String var1)
        GangModel class: com.edwardbelt.edprison.api.models
            Instance Methods
            List<UUID> getGangMembers(String var1)
            String getGang(UUID var1)
            String getGangMemberRank(String var1, UUID var2)
            boolean existGang(String var1)
            double getGangMemberPoints(String var1, UUID var2)
            void addGangMemberPoints(String var1, UUID var2, double var3)
            void removeGangMemberPoints(String var1, UUID var2, double var3)
            void setGangMemberPoints(String var1, UUID var2, double var3)
            double getGangPoints(String var1)
            void addGangPoints(String var1, double var2)
            void removeGangPoints(String var1, double var2)
            void setGangPoints(String var1, double var2)
        LevelModel class: com.edwardbelt.edprison.api.models
            Instance Methods
            double getLevel(UUID playerUUID, String levelId)
            void setLevel(UUID playerUUID, String levelId, double levels)
            void addLevels(UUID playerUUID, String levelId, double levels)
            void removeLevels(UUID playerUUID, String levelId, double levels)
            double getCostOfLevels(UUID playerUUID, String levelId, double levels)
            void buyLevelsAsPlayer(Player player, String levelId, double levels)
            double getMaxLevelsAffordable(UUID playerUUID, String levelId)
        UtilsModel class: com.edwardbelt.edprison.api.models
            Instance Methods
            void openGUI(Player player, String gui)
            double createSphereExplosion(Player player, Block block, int radius, boolean affectAutosell, boolean sound)
            double createNaturalExplosion(Player player, Block block, int radius, boolean affectAutosell, boolean sound)
            String singleNotation(double num)
            String abbreviatedNotation(double num)
        Event Classes
        EdPrisonAddMultiplierCurrency class: com.edwardbelt.edprison.events
            Constructors
            EdPrisonAddMultiplierCurrency(UUID uuid, String currency, double amount)
            
            Static Methods
            static HandlerList getHandlerList()
            
            Instance Methods
            HandlerList getHandlers()
            UUID getUUID()
            boolean isCancelled()
            void setCancelled(boolean var1)
            String getCurrency()
            double getAmount()
            void setAmount(double var1)
            double getMultiplier()
            void addMultiplier(double var1)
            void setMultiplier(double var1)
        EdPrisonBlockBreakEvent class: com.edwardbelt.edprison.events
            Constructors
            EdPrisonBlockBreakEvent(Player player, double blocks)
            
            Static Methods
            static HandlerList getHandlerList()
            
            Instance Methods
            HandlerList getHandlers()
            Player getPlayer()
            boolean isCancelled()
            void setCancelled(boolean var1)
            double getBlocks()
        EdPrisonEnchantFinishTriggerEvent class: com.edwardbelt.edprison.events
            Constructors
            EdPrisonEnchantFinishTriggerEvent(Player player, String enchant, Block block)
            
            Static Methods
            static HandlerList getHandlerList()
            
            Instance Methods
            HandlerList getHandlers()
            Player getPlayer()
            String getEnchant()
            Block getBlock()
        EdPrisonEnchantTriggerEvent class: com.edwardbelt.edprison.events
            Constructors
            EdPrisonEnchantTriggerEvent(Player player, String enchant)
            
            Static Methods
            static HandlerList getHandlerList()
            
            Instance Methods
            HandlerList getHandlers()
            Player getPlayer()
            boolean isCancelled()
            void setCancelled(boolean var1)
            String getEnchant()
        EdPrisonEventTriggered class: com.edwardbelt.edprison.events
            Constructors
            EdPrisonEventTriggered(Player player, String eventId, String enchant, Block block)
            
            Static Methods
            static HandlerList getHandlerList()
            
            Instance Methods
            HandlerList getHandlers()
            Player getPlayer()
            Block getBlock()
            String getEventId()
            String getEnchant()
        EdPrisonPlayerHoldPickaxe class: com.edwardbelt.edprison.events
            Constructors
            EdPrisonPlayerHoldPickaxe(Player player)
            
            Static Methods
            static HandlerList getHandlerList()
            
            Instance Methods
            HandlerList getHandlers()
            Player getPlayer()
        EdPrisonPlayerUnHoldPickaxe class: com.edwardbelt.edprison.events
            Constructors
            EdPrisonPlayerUnHoldPickaxe(Player player)
            
            Static Methods
            static HandlerList getHandlerList()
            
            Instance Methods
            HandlerList getHandlers()
            Player getPlayer()
        EdPrisonPossibleEnchantTriggerEvent class: com.edwardbelt.edprison.events
            Constructors
            EdPrisonPossibleEnchantTriggerEvent(Player player, String enchant, double percent)
            
            Static Methods
            static HandlerList getHandlerList()
            
            Instance Methods
            HandlerList getHandlers()
            Player getPlayer()
            boolean isCancelled()
            void setCancelled(boolean var1)
            String getEnchant()
            double getPercent()
            void setPercent(double var1)
            void addPercent(double var1)
            void removePercent(double var1)

        WorldEditUtils class: com.edwardbelt.edprison.utils
            Constructors
            WorldEditUtils(EdPrison var1)
            
            Static Methods
            static void deleteBlocksInRadius(Location var1, int var2, Player var3)
            static void deleteBlocks(Location var1, Location var2, Player var3)
            static com.sk89q.worldedit.util.Location adapt(Location var1)
            static com.sk89q.worldedit.world.World adapt(World var1)
            static CuboidRegion getCuboidRegionAt(World var1, Vector var2, Vector var3)
            static Object getRegionContainer()
            static ApplicableRegionSet getApplicableRegionSet(Location var1)
            static Vector getMaximumPointRegion(ProtectedRegion var1)
            static Vector getMinimumPointRegion(ProtectedRegion var1)
            static boolean locIsAbleToBreak(Location var1)
            static boolean locIsAbleToPlace(Location var1)
            static HashMap<Material, Double> stringToHashPattern(String var1)
            static Object stringToPattern(String var1)
            static ProtectedRegion getValidRegionInLoc(Location var1)
            static boolean hasValidFlagRadius(Location var1, int var2)
            static Location substract(Location var1, int var2, int var3, int var4)
            static Location add(Location var1, int var2, int var3, int var4)
            static double fillBlocks(UUID var1, Location var2, Location var3, HashMap<Material, Double> var4, boolean var5)
            static Material selectMaterialByPercent(double var1, HashMap<Material, Double> var2) (private)
    `
};