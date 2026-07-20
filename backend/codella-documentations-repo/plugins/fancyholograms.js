module.exports = {
    name: 'FancyHolograms',
    description: 'Hologram plugin for Minecraft.',
    pluginId: 'FancyHolograms',
    mavenIntegration: `
        <repository>
            <id>fancyinnovations-releases</id>
            <name>FancyInnovations Repository</name>
            <url>https://repo.fancyinnovations.com/releases</url>
        </repository>
        <dependency>
            <groupId>de.oliver</groupId>
            <artifactId>FancyHolograms</artifactId>
            <version>2.6.0</version>
            <scope>provided</scope>
        </dependency>
    `,
    usage: `
        Initial Examples:
        Create a new hologram
        #1. Create the hologram data
        The TextHologramData class is used to store all the information about aa hologram. You can create a new instance of TextHologramData by providing a name, and the location where the hologram should be spawned.
        
        
        TextHologramData hologramData = new TextHologramData("hologram_name", location);
        // Adjust the Hologram Data
        hologramData.setBackground(TextColor.color(100, 255, 79));
        hologramData.setBillboard(Display.Billboard.FIXED);
        You can also use ItemHologramData or ItemHologramData to create a holograms with other types.
        
        #2. Create the hologram
        You can use the TextHologramData object to create a new hologram. Because the implementation of the hologram different for every Minecraft version, FancyHolograms provides a factory to create the hologram.
        
        
        HologramManager manager = FancyHologramsPlugin.get().getHologramManager();
        Hologram hologram = manager.create(data);
        #3. Register the hologram
        To let FancyHolograms handle the hologram, you need to register it. FancyHolograms will take care of spawning, despawning, saving the hologram, and more.
        
        
        HologramManager manager = FancyHologramsPlugin.get().getHologramManager();
        manager.addHologram(hologram);
        If you don't want to persist the hologram, you can do the following: hologram.setPersistent(false);
        
        #Modify an existing hologram
        #1. Get the hologram by name
        You can get the hologram by its name. The name is unique and can be used to identify the hologram.
        
        
        HologramManager manager = FancyHologramsPlugin.get().getHologramManager();
        
        Hologram hologram = manager.getHologram("hologram_name").orElse(null);
        if (hologram == null) {
            // hologram not found
            return;
        }
        #2. Modify the data
        You can modify the hologram data object to change the holograms's properties.
        
        
        HologramData hologramData = hologram.getData();
        hologramData.setBillboard(Display.Billboard.CENTER);
        
        if (hologramData instanceof TextHologramData textData) {
                textData.setTextAlignment(TextDisplay.TextAlignment.LEFT);
        }
        #3. Update the hologram
        After modifying the hologram data, you need to update the hologram. This will apply the changes to the hologram.
        
        
        hologram.forceUpdate();
        hologram.queueUpdate();
        #Remove a hologram
        To remove a hologram, you can use the removeHologram method of the HologramManager. This will remove the hologram and unregister it.
        
        
        HologramManager manager = FancyHologramsPlugin.get().getHologramManager();
        manager.removeHologram("hologram_name");
        
        
        FancyHologramsPlugin interface: de.oliver.fancyholograms.api
        Static Methods
        javastatic FancyHologramsPlugin get()
        static boolean isEnabled()
        Interface Methods
        javaJavaPlugin getPlugin()
        ExtendedFancyLogger getFancyLogger()
        HologramManager getHologramManager()
        HologramConfiguration getHologramConfiguration()
        void setHologramConfiguration(HologramConfiguration configuration, boolean reload)
        HologramStorage getHologramStorage()
        ScheduledExecutorService getHologramThread()
        void setHologramStorage(HologramStorage storage, boolean reload)
        HologramManager interface: de.oliver.fancyholograms.api
        Interface Methods
        javaOptional<Hologram> getHologram(String name)
        Collection<Hologram> getPersistentHolograms()
        Collection<Hologram> getHolograms()
        void addHologram(Hologram hologram)
        void removeHologram(Hologram hologram)
        Hologram create(HologramData hologramData)
        void loadHolograms()
        void saveHolograms()
        void reloadHolograms()
        HologramStorage interface: de.oliver.fancyholograms.api
        Interface Methods
        javavoid saveBatch(Collection<Hologram> holograms, boolean override)
        void save(Hologram hologram)
        void delete(Hologram hologram)
        Collection<Hologram> loadAll()
        Collection<Hologram> loadAll(String world)
        HologramConfiguration interface: de.oliver.fancyholograms.api
        Interface Methods
        javavoid reload(@NotNull FancyHologramsPlugin plugin)
        boolean isAutosaveEnabled()
        int getAutosaveInterval()
        boolean isSaveOnChangedEnabled()
        String getLogLevel()
        boolean isHologramLoadLogging()
        boolean areVersionNotificationsEnabled()
        int getDefaultVisibilityDistance()
        boolean isRegisterCommands()
        int getUpdateVisibilityInterval()
        Hologram abstract class: de.oliver.fancyholograms.api.hologram
        Constructors
        javaHologram(@NotNull HologramData data)
        Public Methods
        java@NotNull String getName()
        @NotNull HologramData getData()
        abstract int getEntityId()
        @ApiStatus.Internal @Deprecated abstract @Nullable Display getDisplayEntity()
        void createHologram()
        void deleteHologram()
        void showHologram(Collection<? extends Player> players)
        void showHologram(Player player)
        void forceShowHologram(Player player)
        void hideHologram(Collection<? extends Player> players)
        void hideHologram(Player player)
        void forceHideHologram(Player player)
        @Deprecated void updateHologram()
        void queueUpdate()
        void forceUpdate()
        void refreshForViewers()
        void refreshForViewersInWorld()
        void refreshHologram(@NotNull Player player)
        void refreshHologram(@NotNull Collection<? extends Player> players)
        @NotNull Set<UUID> getViewers()
        boolean isViewer(@NotNull Player player)
        boolean isViewer(@NotNull UUID player)
        boolean meetsVisibilityConditions(@NotNull Player player)
        boolean isWithinVisibilityDistance(@NotNull Player player)
        void updateShownStateFor(Player player)
        void forceUpdateShownStateFor(Player player)
        Component getShownText(@Nullable Player player)
        boolean equals(@Nullable Object o) (overrides)
        int hashCode() (overrides)
        HologramData class: de.oliver.fancyholograms.api.data
        Constructors
        javaHologramData(String name, HologramType type, Location location)
        Public Methods
        java@NotNull String getName()
        @NotNull HologramType getType()
        @NotNull Location getLocation()
        HologramData setLocation(@Nullable Location location)
        boolean hasChanges()
        void setHasChanges(boolean hasChanges)
        int getVisibilityDistance()
        HologramData setVisibilityDistance(int visibilityDistance)
        Visibility getVisibility()
        HologramData setVisibility(@NotNull Visibility visibility)
        boolean isPersistent()
        HologramData setPersistent(boolean persistent)
        String getLinkedNpcName()
        HologramData setLinkedNpcName(String linkedNpcName)
        boolean read(ConfigurationSection section, String name) (overrides)
        boolean write(ConfigurationSection section, String name) (overrides)
        HologramData copy(String name)
        DisplayHologramData class: de.oliver.fancyholograms.api.data
        Constructors
        javaDisplayHologramData(String name, HologramType type, Location location)
        Public Methods
        javaDisplay.Billboard getBillboard()
        DisplayHologramData setBillboard(Display.Billboard billboard)
        Vector3f getScale()
        DisplayHologramData setScale(Vector3f scale)
        Vector3f getTranslation()
        DisplayHologramData setTranslation(Vector3f translation)
        Display.Brightness getBrightness()
        DisplayHologramData setBrightness(Display.Brightness brightness)
        float getShadowRadius()
        DisplayHologramData setShadowRadius(float shadowRadius)
        float getShadowStrength()
        DisplayHologramData setShadowStrength(float shadowStrength)
        @ApiStatus.Experimental int getInterpolationDuration()
        @ApiStatus.Experimental DisplayHologramData setInterpolationDuration(int interpolationDuration)
        boolean read(ConfigurationSection section, String name) (overrides)
        boolean write(ConfigurationSection section, String name) (overrides)
        DisplayHologramData copy(String name) (overrides)
        TextHologramData class: de.oliver.fancyholograms.api.data
        Constructors
        javaTextHologramData(String name, Location location)
        Public Methods
        javaList<String> getText()
        TextHologramData setText(List<String> text)
        void addLine(String line)
        void removeLine(int index)
        Color getBackground()
        TextHologramData setBackground(Color background)
        TextDisplay.TextAlignment getTextAlignment()
        TextHologramData setTextAlignment(TextDisplay.TextAlignment textAlignment)
        boolean hasTextShadow()
        TextHologramData setTextShadow(boolean textShadow)
        boolean isSeeThrough()
        TextHologramData setSeeThrough(boolean seeThrough)
        int getTextUpdateInterval()
        TextHologramData setTextUpdateInterval(int textUpdateInterval)
        boolean read(ConfigurationSection section, String name) (overrides)
        boolean write(ConfigurationSection section, String name) (overrides)
        TextHologramData copy(String name) (overrides)
        BlockHologramData class: de.oliver.fancyholograms.api.data
        Constructors
        javaBlockHologramData(String name, Location location)
        Public Methods
        javaMaterial getBlock()
        BlockHologramData setBlock(Material block)
        boolean read(ConfigurationSection section, String name) (overrides)
        boolean write(ConfigurationSection section, String name) (overrides)
        BlockHologramData copy(String name) (overrides)
        ItemHologramData class: de.oliver.fancyholograms.api.data
        Constructors
        javaItemHologramData(String name, Location location)
        Public Methods
        javaItemStack getItemStack()
        ItemHologramData setItemStack(ItemStack item)
        boolean read(ConfigurationSection section, String name) (overrides)
        boolean write(ConfigurationSection section, String name) (overrides)
        ItemHologramData copy(String name) (overrides)
        YamlData interface: de.oliver.fancyholograms.api.data
        Interface Methods
        javaboolean read(ConfigurationSection section, String name)
        boolean write(ConfigurationSection section, String name)
        Enumerations
        HologramType enum: de.oliver.fancyholograms.api.hologram
        TEXT
        ITEM
        BLOCK
        Static Methods
        javastatic HologramType getByName(String name)
        Enum Methods
        javaList<String> getCommands()
        Visibility enum: de.oliver.fancyholograms.api.data.property
        ALL
        PERMISSION_REQUIRED
        MANUAL
        Static Methods
        javastatic Optional<Visibility> byString(String value)
        Enum Methods
        javaboolean canSee(Player player, Hologram hologram)
        Nested Classes
        ManualVisibility class: de.oliver.fancyholograms.api.data.property.Visibility.ManualVisibility
        Static Methods
        javastatic boolean canSee(Player player, Hologram hologram)
        static void addDistantViewer(Hologram hologram, UUID uuid)
        static void addDistantViewer(String hologramName, UUID uuid)
        static void removeDistantViewer(Hologram hologram, UUID uuid)
        static void removeDistantViewer(String hologramName, UUID uuid)
        static void remove(Hologram hologram)
        static void remove(String hologramName)
        static void clear()
    `
};