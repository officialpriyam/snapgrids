module.exports = {
    name: 'HeadDatabaseAPI',
    description: 'Head Database is a fast and user-friendly plugin that allows you to obtain thousands of custom Minecraft skulls that feature unique designs. This easy-to-use heads plugin gives you access to creative designing opportunities that overall enhances the quality of your builds, and gives creative freedom to yourself and your players.',
    pluginId: 'HeadDatabaseAPI',
    mavenIntegration: `
        <repositories>
            // MAVEN CENTRAL REPOSITORY
        </repositories>
        <dependency>
            <groupId>com.arcaniax</groupId>
            <artifactId>HeadDatabase-API</artifactId>
            <version>1.3.2</version>
            <scope>provided</scope>
        </dependency>
    `,
    usage: `
    Example usage
    import me.arcaniax.hdb.api.DatabaseLoadEvent;
    import me.arcaniax.hdb.api.HeadDatabaseAPI;
    import org.bukkit.event.EventHandler;
    import org.bukkit.event.Listener;
    import org.bukkit.inventory.ItemStack;
    import org.bukkit.plugin.java.JavaPlugin;
    
    public class HeadDatabaseAPIPlugin extends JavaPlugin implements Listener {
    
        public void onEnable() {
            this.getServer().getPluginManager().registerEvents(this, this);
        }
    
        @EventHandler
        public void onDatabaseLoad(DatabaseLoadEvent e) {
            HeadDatabaseAPI api = new HeadDatabaseAPI();
            try {
                ItemStack item = api.getItemHead("7129");
                getLogger().info(api.getItemID(item));
            } catch (NullPointerException nullPointerException) {
                getLogger().info("Could not find the head you were looking for");
            }
        }
    }
    Tips:
    Don't forget to add HeadDatabase to depend or softdepend section of your plugin.yml
    Listen to DatabaseLoadEvent and register your events afterwards. The event is fired once HeadDatabase is loaded successfully.
    
    HeadDatabaseAPI class: me.arcaniax.hdb.api
    Instance Methods
    void setPrefixID(String var1)
    boolean isHead(String var1)
    boolean isDecorativeHead(Block var1)
    boolean isDecorativeHead(ItemStack var1)
    ItemStack getItemHead(String var1)
    ItemStack getItemHead(Block var1)
    String getItemID(ItemStack var1)
    String getBlockID(Block var1)
    String getBase64(String var1)
    String getBase64(ItemStack var1)
    String getBase64(Block var1)
    boolean addHead(CategoryEnum var1, Head var2)
    List<Head> getHeads(CategoryEnum var1)
    ItemStack getRandomHead()
    CategoryEnum getCategory(String var1)
    boolean setBlockSkin(Block var1, String var2)
    String addHead(CategoryEnum var1, String var2, UUID var3)
    String addHead(CategoryEnum var1, String var2, String var3)
    boolean removeHead(String var1)
    
    `
};