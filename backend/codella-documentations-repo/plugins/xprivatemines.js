module.exports = {
    name: 'XPrivateMines',
    description: 'XPrivateMines is a private mines plugin for prison servers.',
    pluginId: 'XPrivateMines',
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
                <artifactId>XPrivateMinesAPI</artifactId>
                <version>1.0</version>
                <scope>provided</scope>
            </dependency>
        </dependencies>
    `,
    usage: `
    XPrivateMinesAPI interface: dev.drawethree.xprivatemines.api

    Static Methods
    static dev.drawethree.xprivatemines.api.XPrivateMinesAPI getInstance()
    
    Instance Methods
    dev.drawethree.xprivatemines.api.manager.MineTierManager getTierManager()
    dev.drawethree.xprivatemines.api.manager.PrivateMinesManager getMinesManager()
    
    PrivateMinesManager interface: dev.drawethree.xprivatemines.api.manager
    Instance Methods
    java.util.concurrent.CompletableFuture<dev.drawethree.xprivatemines.api.model.PrivateMine> createPrivateMine(org.bukkit.OfflinePlayer owner, dev.drawethree.xprivatemines.api.model.MinesSchematic schematic)
    void deleteMine(org.bukkit.command.CommandSender sender, dev.drawethree.xprivatemines.api.model.PrivateMine mine)
    dev.drawethree.xprivatemines.api.model.PrivateMine getPrivateMine(org.bukkit.OfflinePlayer player)
    dev.drawethree.xprivatemines.api.model.PrivateMine getPrivateMineAtLocation(org.bukkit.Location location)
    java.util.Collection<dev.drawethree.xprivatemines.api.model.PrivateMine> getAll()
    boolean forceExpand(org.bukkit.command.CommandSender sender, dev.drawethree.xprivatemines.api.model.PrivateMine mine, int expandAmount)
    boolean isMaxExpand(dev.drawethree.xprivatemines.api.model.PrivateMine mine)
    boolean forceUpgrade(org.bukkit.command.CommandSender sender, dev.drawethree.xprivatemines.api.model.PrivateMine mine, dev.drawethree.xprivatemines.api.model.MineTier tier)
    boolean isMaxTier(dev.drawethree.xprivatemines.api.model.PrivateMine mine)
    double getNextUpgradeCost(dev.drawethree.xprivatemines.api.model.PrivateMine mine)
    boolean shouldReset(dev.drawethree.xprivatemines.api.model.PrivateMine mine)
    void refill(dev.drawethree.xprivatemines.api.model.PrivateMine mine)
    void pregen(org.bukkit.command.CommandSender sender, dev.drawethree.xprivatemines.api.model.MinesSchematic schematic, int amount)
    boolean isPregenRunning()
    void stopPregen()
    void banPlayer(dev.drawethree.xprivatemines.api.model.PrivateMine mine, org.bukkit.OfflinePlayer player)
    void unbanPlayer(dev.drawethree.xprivatemines.api.model.PrivateMine mine, org.bukkit.OfflinePlayer player)
    void kickPlayer(org.bukkit.entity.Player target)
    
    MineTierManager interface: dev.drawethree.xprivatemines.api.manager
    
    Instance Methods
    java.util.Optional<dev.drawethree.xprivatemines.api.model.MineTier> getNextTier(String currentKey)
    java.util.Optional<dev.drawethree.xprivatemines.api.model.MineTier> getNextTier(dev.drawethree.xprivatemines.api.model.MineTier mineTier)
    java.util.List<dev.drawethree.xprivatemines.api.model.MineTier> getAllTiers()
    dev.drawethree.xprivatemines.api.model.MineTier getDefaultTier()
    dev.drawethree.xprivatemines.api.model.MineTier getTier(String key)
    
    
    PrivateMine interface: dev.drawethree.xprivatemines.api.model
    
    Instance Methods
    java.util.UUID getUuid()
    java.util.UUID getOwner()
    org.bukkit.OfflinePlayer getOfflineOwner()
    dev.drawethree.xprivatemines.api.model.Mine getMine()
    boolean isBanned(org.bukkit.OfflinePlayer player)
    void teleport(org.bukkit.entity.Player player)
    boolean isInMine(org.bukkit.Location location)
    boolean isInPrivateMine(org.bukkit.Location location)
    boolean isOwner(org.bukkit.OfflinePlayer player)
    boolean isOpen()
    void setOpen(boolean open)
    double getEntryFee()
    void setEntryFee(double newFee)
    double getTax()
    void setTax(double newTax)
    int getExpandLevel()
    void setExpandLevel(int level)
    double getResetPercentage()
    void setResetPercentage(int resetPercentage)
    double getUnclaimedMoney()
    void setUnclaimedMoney(double money)
    double getXOffset()
    double getZOffset()
    dev.drawethree.xprivatemines.api.model.MineTier getTier()
    void setTier(dev.drawethree.xprivatemines.api.model.MineTier tier)
    
    
    Mine interface: dev.drawethree.xprivatemines.api.model
    
    Instance Methods
    org.codemc.worldguardwrapper.region.IWrappedRegion getRegion()
    void setRegion(org.codemc.worldguardwrapper.region.IWrappedRegion region)
    org.bukkit.Material getSelectedMaterial()
    void setSelectedMaterial(org.bukkit.Material material)
    long getTotalBlockCount()
    void setTotalBlockCount(long count)
    long getEstimatedRemainingBlocks()
    void setEstimatedRemainingBlocks(long count)
    void decrementRemainingBlockCount()
    void handleBlockBreak(java.util.List<org.bukkit.block.Block> blocks)
    
    
    MineTier interface: dev.drawethree.xprivatemines.api.model
    
    Instance Methods
    String getKey()
    String getName()
    double getUpgradeCost()
    java.util.Map<com.cryptomorin.xseries.XMaterial, Integer> getBlockWeights()
    
    
    MinesSchematic interface: dev.drawethree.xprivatemines.api.model
    
    Instance Methods
    java.io.File getFile()
    String getName()
    dev.drawethree.xprivatemines.api.model.SchematicSettings getSettings()
    
    
    SchematicSettings interface: dev.drawethree.xprivatemines.api.model
    
    Instance Methods
    String getPermission()
    me.lucko.helper.serialize.Point getSpawn()
    me.lucko.helper.serialize.Point getResetLocation()
    me.lucko.helper.serialize.Position getRegionPos1()
    me.lucko.helper.serialize.Position getRegionPos2()
    me.lucko.helper.serialize.Position getMinesPos1()
    me.lucko.helper.serialize.Position getMinesPos2()
    int getMaxExpand()
    int getMineSize()
    double getExpandCost()
    int getRegionPriority()
    int getMineRegionPriority()
    java.util.Map<String, org.codemc.worldguardwrapper.flag.WrappedState> getRegionFlags()
    java.util.Map<String, org.codemc.worldguardwrapper.flag.WrappedState> getMineRegionFlags()
    `
};