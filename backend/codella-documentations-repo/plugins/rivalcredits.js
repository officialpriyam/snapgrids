module.exports = {
    name: 'RivalCredits',
    description: 'Credits plugin with integrated GUI-based shop system.',
    pluginId: 'RivalCredits',
    systemDownloadURL: 'https://raw.githubusercontent.com/CodellaAI/codella-documentations/main/lib/RivalCredits-API.jar',
    mavenIntegration: `
        <repositories>
            // SYSTEM DEPENDENCY NO REPOSITORY
        </repositories>
        <dependencies>
            <!-- RivalCredits main API -->
            <dependency>
                <groupId>me.rivaldev.credits</groupId>
                <artifactId>api</artifactId>
                <version>1.0</version>
                <scope>system</scope>
                <systemPath>\${basedir}/lib/RivalCredits-API.jar</systemPath>
            </dependency>
        </dependencies>
    `,
    usage: `
    CreditAPI class: me.rivaldev.credits
    Static Fields
    static CreditAPI instance
    static DecimalFormat df
    
    Static Methods
    static String getFormattedDouble(double var0)
    static CreditAPI getInstance()
    static void openPage(String var0, Player var1)
    static void openPage(int var0, String var1, Player var2)
    static int getCategoryPackages(String var0)
    static ItemStack getPageItems(String var0, String var1, Player var2)
    static ItemStack getPageItemsDiscounted(String var0, String var1, Player var2, double var3)
    static void handleShop(Player var0, String var1, String var2, int var3)
    static void handleShopDiscounted(Player var0, String var1, String var2, double var3, int var5)
    static ItemStack getCustomTextureHead(String var0)
    static String color(Player var0, String var1)
    static String color(String var0)
    static boolean runningPAPI()
    static ItemStack addGlow(ItemStack var0, boolean var1)
    
    Instance Methods
    double getCredits(OfflinePlayer var1)
    synchronized void addCredits(OfflinePlayer var1, double var2)
    void addCredit(OfflinePlayer var1, double var2)
    void removeCredits(OfflinePlayer var1, double var2)
    void setCredits(OfflinePlayer var1, double var2)
    boolean isInt(String var1)
    boolean isDouble(String var1)
    String getPrefix()
    
    RivalPackagePrePurchaseEvent class: me.rivaldev.credits.api
    Extends: Event
    Implements: Cancellable
    Constructor
    public RivalPackagePrePurchaseEvent(Player var1, String var2, String var3, double var4)
    
    Static Fields
    static final HandlerList HANDLERS
    
    Instance Methods
    Player getPlayer()
    double getPrice()
    String getCategory()
    String getPackage()
    HandlerList getHandlers()
    boolean isCancelled()
    void setCancelled(boolean var1)
    
    Static Methods
    static HandlerList getHandlerList()
    
    RivalPackagePurchaseEvent class: me.rivaldev.credits.api
    Extends: Event
    Constructor
    public RivalPackagePurchaseEvent(Player var1, String var2, String var3, double var4)
    
    Static Fields
    static final HandlerList HANDLERS
    
    Instance Methods
    Player getPlayer()
    double getPrice()
    String getCategory()
    String getPackage()
    HandlerList getHandlers()
    
    Static Methods
    static HandlerList getHandlerList()
    `
};