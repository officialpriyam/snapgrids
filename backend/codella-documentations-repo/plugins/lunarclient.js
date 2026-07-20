module.exports = {
    name: 'LunarClient API',
    description: 'API to access Lunar Client features (Apollo-<Platform>)',
    pluginId: 'Apollo-<Bukkit|Bungee|Velocity>',
    mavenIntegration: `
        <repositories>
            <repository>
                <id>lunarclient</id>
                <url>https://repo.lunarclient.dev</url>
            </repository>
        </repositories>
        The apollo-extra-adventure dependency is required if you do not already have a dependency to Adventure. Adventure does not need to be shaded into your plugin.
        <dependencies>
            <dependency>
                <groupId>com.lunarclient</groupId>
                <artifactId>apollo-api</artifactId>
                <version>1.1.8</version>
                <scope>provided</scope>
            </dependency>
            <!-- For Adventure support add the following dependency. -->
            <dependency>
                <groupId>com.lunarclient</groupId>
                <artifactId>apollo-extra-adventure4</artifactId>
                <version>1.1.8</version>
                <scope>provided</scope>
            </dependency>
        </dependencies>
    `,
    usage: `
        The Apollo plugin is called Apollo-<platform> where <platform> is the name of the server software you're using.
        In Bukkit/Spigot/Paper it would be Apollo-Bukkit

        Introduction
        Apollo is a powerful tool that allows developers to create custom integrations with Lunar Client.

        Apollo enables server owners and developers to tweak the capabilities of Lunar Client on their server, create custom experiences not possible in vanilla Minecraft, and add quality-of-life features.
        
        We have a lot planned for Apollo, and are very open to suggestions and contributions.
        
        This documentation will provide you with all information you'll need to know to start integrating Apollo into your server or plugins! We'll cover the basics of Apollo, from changing the configuration file to integrating your own features using each module. Inside the module breakdowns, for developers, we'll include code snippets along with photos, videos, and GIFs related to the module to ensure you get the most out of Apollo.
            
        Common Patterns
        These are general features and how-to's inside of Apollo. You will see these options appear throughout Apollo and while reading the documentation.
        
        We recommend you use and understand these general features.
        
        Player
        Checking if player is running Lunar Client
        boolean runningLunarClient = Apollo.getPlayerManager().hasSupport(player.getUniqueId());
        
        Getting an ApolloPlayer object by player UUID
        Optional<ApolloPlayer> apolloPlayer = Apollo.getPlayerManager().getPlayer(player.getUniqueId());
        
        Get all players running Lunar Client
        Collection<ApolloPlayer> playersRunningLunarClient = Apollo.getPlayerManager().getPlayers();
        
        Module
        Get a specific module
        BorderModule borderModule = Apollo.getModuleManager().getModule(BorderModule.class);
        
        Recipients
        Creating recipients with a single Apollo Player
        apolloPlayer.ifPresent(apolloPlayerObject -> {
            Recipients recipients = apolloPlayerObject;
        });
        
        Creating recipients with all players running Lunar Client
        Recipients allRecipients = Recipients.ofEveryone();
        
        Creating recipients with all players running Lunar Client with names shorter than 6 characters
        Recipients filteredRecipients = Recipients.of(
            Apollo.getPlayerManager().getPlayers().stream()
                .filter(online -> online.getName().length() < 6)
                .collect(Collectors.toList())
        );
        
        Event Sample:
        Sample Code (Method 1)
        public class GeneralExample1 implements ApolloListener {
         
            public GeneralExample1() {
                EventBus.getBus().register(this);
            }
         
            @Listen
            public void onApolloRegister(ApolloRegisterPlayerEvent event) {
                ((Player) event.getPlayer().getPlayer()).sendMessage("You have joined using LunarClient!");
            }
        }
        
        Full classes:
        MAIN Package: com.lunarclient.apollo
        Example 01: Check if Apollo is available and get basic module access.
        javapublic boolean isApolloAvailable() {
            try {
                return Apollo.getPlatform() != null;
            } catch (UnsupportedOperationException e) {
                return false;
            }
        }
        
        public void displayWaypoint(Player player, String name, Location location, Color color) {
            WaypointModule waypointModule = Apollo.getModuleManager().getModule(WaypointModule.class);
            if (waypointModule != null) {
                Waypoint waypoint = Waypoint.builder()
                    .name(name)
                    .location(ApolloBlockLocation.builder()
                        .world(location.getWorld().getName())
                        .x(location.getBlockX())
                        .y(location.getBlockY())
                        .z(location.getBlockZ())
                        .build())
                    .color(color)
                    .preventRemoval(false)
                    .hidden(false)
                    .build();
                
                waypointModule.displayWaypoint(Recipients.of(player), waypoint);
            }
        }
        Apollo class: com.lunarclient.apollo
        Static Methods
        javastatic ApolloPlatform getPlatform()
        static ApolloModuleManager getModuleManager()
        static ApolloWorldManager getWorldManager()
        static ApolloPlayerManager getPlayerManager()
        ApolloModuleManager interface: com.lunarclient.apollo.module
        Interface Methods
        javaboolean isEnabled(Class<? extends ApolloModule> moduleClass)
        <T extends ApolloModule> T getModule(Class<T> moduleClass)
        Collection<ApolloModule> getModules()
        ApolloModule abstract class: com.lunarclient.apollo.module
        Constructors
        javaApolloModule()
        Public Methods
        javaString getId()
        String getName()
        ConfigTarget getConfigTarget()
        Collection<ApolloPlatform.Kind> getSupportedPlatforms()
        boolean isClientNotify()
        void enable()
        void disable()
        boolean isEnabled()
        Options getOptions()
        Protected Methods
        javavoid registerOptions(Option<?, ?, ?>... options)
        void onEnable()
        WaypointModule abstract class: com.lunarclient.apollo.module.waypoint
        Public Methods
        javaboolean isClientNotify() (overrides)
        abstract void displayWaypoint(Recipients recipients, Waypoint waypoint)
        abstract void removeWaypoint(Recipients recipients, String waypointName)
        abstract void removeWaypoint(Recipients recipients, Waypoint waypoint)
        abstract void resetWaypoints(Recipients recipients)
        Waypoint class: com.lunarclient.apollo.module.waypoint
        Public Methods
        javaString getName()
        ApolloBlockLocation getLocation()
        Color getColor()
        boolean isPreventRemoval()
        boolean isHidden()
        VignetteModule abstract class: com.lunarclient.apollo.module.vignette
        Public Methods
        javaabstract void displayVignette(Recipients recipients, Vignette vignette)
        abstract void resetVignette(Recipients recipients)
        Vignette class: com.lunarclient.apollo.module.vignette
        Public Methods
        javaString getResourceLocation()
        @Range(from = 0, to = 1) float getOpacity()
        TntCountdownModule abstract class: com.lunarclient.apollo.module.tntcountdown
        Public Methods
        javaboolean isClientNotify() (overrides)
        abstract void setTntCountdown(ApolloEntity entity, @Range(from = 0, to = Integer.MAX_VALUE) int ticks)
        abstract void setTntCountdown(Recipients recipients, ApolloEntity entity, @Range(from = 0, to = Integer.MAX_VALUE) int ticks)
        TransferModule abstract class: com.lunarclient.apollo.module.transfer
        Public Methods
        javaCollection<ApolloPlatform.Kind> getSupportedPlatforms() (overrides)
        Future<PingResponse> ping(ApolloPlayer player, List<String> serverIps)
        Future<TransferResponse> transfer(ApolloPlayer player, String serverIp)
        abstract Future<PingResponse> ping(ApolloPlayer player, PingRequest request)
        abstract Future<TransferResponse> transfer(ApolloPlayer player, TransferRequest request)
        TransferRequest class: com.lunarclient.apollo.module.transfer
        Public Methods
        javaString getServerIp()
        TransferResponse class: com.lunarclient.apollo.module.transfer
        Public Methods
        javaStatus getStatus()
        PingRequest class: com.lunarclient.apollo.module.transfer
        Public Methods
        javaList<String> getServerIps()
        PingResponse class: com.lunarclient.apollo.module.transfer
        Public Methods
        javaList<PingData> getData()
        TitleModule abstract class: com.lunarclient.apollo.module.title
        Public Methods
        javaabstract void displayTitle(Recipients recipients, Title title)
        abstract void resetTitles(Recipients recipients)
        Title class: com.lunarclient.apollo.module.title
        Public Methods
        javaTitleType getType()
        Component getMessage()
        @Range(from = 0, to = Integer.MAX_VALUE) float getScale()
        Duration getDisplayTime()
        Duration getFadeInTime()
        Duration getFadeOutTime()
        @Range(from = 0, to = Integer.MAX_VALUE) float getInterpolationScale()
        @Range(from = 0, to = Integer.MAX_VALUE) float getInterpolationRate()
        TebexModule abstract class: com.lunarclient.apollo.module.tebex
        Public Methods
        javaabstract void displayTebexEmbeddedCheckout(Recipients recipients, String basketIdent)
        abstract void displayTebexEmbeddedCheckout(Recipients recipients, String basketIdent, String locale)
        TeamModule abstract class: com.lunarclient.apollo.module.team
        Public Methods
        javaabstract void updateTeamMembers(Recipients recipients, List<TeamMember> teamMembers)
        abstract void resetTeamMembers(Recipients recipients)
        TeamMember class: com.lunarclient.apollo.module.team
        Public Methods
        javaUUID getPlayerUuid()
        Component getDisplayName()
        Color getMarkerColor()
        ApolloLocation getLocation()
        StopwatchModule abstract class: com.lunarclient.apollo.module.stopwatch
        Public Methods
        javaCollection<ApolloPlatform.Kind> getSupportedPlatforms() (overrides)
        abstract void startStopwatch(Recipients recipients)
        abstract void stopStopwatch(Recipients recipients)
        abstract void resetStopwatch(Recipients recipients)
        StaffModModule abstract class: com.lunarclient.apollo.module.staffmod
        Public Methods
        javaabstract void enableStaffMods(Recipients recipients, List<StaffMod> mods)
        abstract void disableStaffMods(Recipients recipients, List<StaffMod> mods)
        abstract void enableAllStaffMods(Recipients recipients)
        abstract void disableAllStaffMods(Recipients recipients)
        SaturationModule class: com.lunarclient.apollo.module.saturation
        Public Methods
        javaboolean isClientNotify() (overrides)
        RichPresenceModule abstract class: com.lunarclient.apollo.module.richpresence
        Public Methods
        javaabstract void overrideServerRichPresence(Recipients recipients, ServerRichPresence richPresence)
        abstract void resetServerRichPresence(Recipients recipients)
        ServerRichPresence class: com.lunarclient.apollo.module.richpresence
        Public Methods
        java@Nullable String getGameName()
        @Nullable String getGameVariantName()
        @Nullable String getGameState()
        @Nullable String getPlayerState()
        @Nullable String getMapName()
        @Nullable String getSubServerName()
        int getTeamCurrentSize()
        int getTeamMaxSize()
        PacketEnrichmentModule abstract class: com.lunarclient.apollo.module.packetenrichment
        Constructors
        javaPacketEnrichmentModule()
        PlayerInfo class: com.lunarclient.apollo.module.packetenrichment
        Public Methods
        javaUUID getPlayerUuid()
        ApolloPlayerLocation getLocation()
        boolean isSneaking()
        boolean isSprinting()
        boolean isJumping()
        float getForwardSpeed()
        float getStrafeSpeed()
        NotificationModule abstract class: com.lunarclient.apollo.module.notification
        Public Methods
        javaCollection<ApolloPlatform.Kind> getSupportedPlatforms() (overrides)
        abstract void displayNotification(Recipients recipients, Notification notification)
        abstract void resetNotifications(Recipients recipients)
        Notification class: com.lunarclient.apollo.module.notification
        Public Methods
        java@Deprecated String getTitle()
        @Deprecated String getDescription()
        Component getTitleComponent()
        Component getDescriptionComponent()
        @Nullable String getResourceLocation()
        Duration getDisplayTime()
        NickHiderModule abstract class: com.lunarclient.apollo.module.nickhider
        Public Methods
        javaabstract void overrideNick(Recipients recipients, String nick)
        abstract void resetNick(Recipients recipients)
        NametagModule abstract class: com.lunarclient.apollo.module.nametag
        Public Methods
        javaabstract void overrideNametag(Recipients recipients, UUID playerUuid, Nametag nametag)
        abstract void resetNametag(Recipients recipients, UUID playerUuid)
        abstract void resetNametags(Recipients recipients)
        Nametag class: com.lunarclient.apollo.module.nametag
        Public Methods
        javaList<Component> getLines()
        ModSettingModule class: com.lunarclient.apollo.module.modsetting
        Public Methods
        javaCollection<ApolloPlatform.Kind> getSupportedPlatforms() (overrides)
        boolean isClientNotify() (overrides)
        LimbModule abstract class: com.lunarclient.apollo.module.limb
        Public Methods
        javaabstract void hideArmorPieces(Recipients recipients, UUID playerUuid, Collection<ArmorPiece> armorPieces)
        abstract void resetArmorPieces(Recipients recipients, UUID playerUuid, Collection<ArmorPiece> armorPieces)
        abstract void hideBodyParts(Recipients recipients, UUID playerUuid, Collection<BodyPart> bodyParts)
        abstract void resetBodyParts(Recipients recipients, UUID playerUuid, Collection<BodyPart> bodyParts)
        InventoryModule class: com.lunarclient.apollo.module.inventory
        Constructors
        javaInventoryModule()
        Public Methods
        javaboolean isClientNotify() (overrides)
        HologramModule abstract class: com.lunarclient.apollo.module.hologram
        Public Methods
        javaabstract void displayHologram(Recipients recipients, Hologram hologram)
        abstract void removeHologram(Recipients recipients, String hologramId)
        abstract void removeHologram(Recipients recipients, Hologram hologram)
        abstract void resetHolograms(Recipients recipients)
        Hologram class: com.lunarclient.apollo.module.hologram
        Public Methods
        javaString getId()
        ApolloLocation getLocation()
        List<Component> getLines()
        boolean isShowThroughWalls()
        boolean isShowShadow()
        boolean isShowBackground()
        GlowModule abstract class: com.lunarclient.apollo.module.glow
        Public Methods
        javaboolean isClientNotify() (overrides)
        abstract void overrideGlow(Recipients recipients, UUID glowingPlayer, Color color)
        abstract void resetGlow(Recipients recipients, UUID glowingPlayer)
        abstract void resetGlow(Recipients recipients)
        GlintModule class: com.lunarclient.apollo.module.glint
        Public Methods
        javaboolean isClientNotify() (overrides)
        EntityModule abstract class: com.lunarclient.apollo.module.entity
        Public Methods
        javaabstract void overrideRainbowSheep(Recipients recipients, List<ApolloEntity> sheepEntities)
        abstract void resetRainbowSheep(Recipients recipients, List<ApolloEntity> sheepEntities)
        abstract void flipEntity(Recipients recipients, List<ApolloEntity> entities)
        abstract void resetFlippedEntity(Recipients recipients, List<ApolloEntity> entities)
        CooldownModule abstract class: com.lunarclient.apollo.module.cooldown
        Public Methods
        javaabstract void displayCooldown(Recipients recipients, Cooldown cooldown)
        abstract void removeCooldown(Recipients recipients, String cooldownName)
        abstract void removeCooldown(Recipients recipients, Cooldown cooldown)
        abstract void resetCooldowns(Recipients recipients)
        Cooldown class: com.lunarclient.apollo.module.cooldown
        Public Methods
        javaString getName()
        Duration getDuration()
        Icon getIcon()
        CombatModule class: com.lunarclient.apollo.module.combat
        Public Methods
        javaboolean isClientNotify() (overrides)
        ColoredFireModule abstract class: com.lunarclient.apollo.module.coloredfire
        Public Methods
        javaboolean isClientNotify() (overrides)
        abstract void overrideColoredFire(Recipients recipients, UUID burningPlayer, Color color)
        abstract void resetColoredFire(Recipients recipients, UUID burningPlayer)
        abstract void resetColoredFires(Recipients recipients)
        ChatModule abstract class: com.lunarclient.apollo.module.chat
        Public Methods
        javaabstract void displayLiveChatMessage(Recipients recipients, Component text, int messageId)
        abstract void removeLiveChatMessage(Recipients recipients, int messageId)
        BorderModule abstract class: com.lunarclient.apollo.module.border
        Public Methods
        javaabstract void displayBorder(Recipients recipients, Border border)
        abstract void removeBorder(Recipients recipients, String borderId)
        abstract void removeBorder(Recipients recipients, Border border)
        abstract void resetBorders(Recipients recipients)
        Border class: com.lunarclient.apollo.module.border
        Public Methods
        javaString getId()
        String getWorld()
        boolean isCancelEntry()
        boolean isCancelExit()
        boolean isCanShrinkOrExpand()
        Color getColor()
        Cuboid2D getBounds()
        @Range(from = 0, to = Integer.MAX_VALUE) int getDurationTicks()
        BeamModule abstract class: com.lunarclient.apollo.module.beam
        Public Methods
        javaabstract void displayBeam(Recipients recipients, Beam beam)
        abstract void removeBeam(Recipients recipients, String beamId)
        abstract void removeBeam(Recipients recipients, Beam beam)
        abstract void resetBeams(Recipients recipients)
        Beam class: com.lunarclient.apollo.module.beam
        Public Methods
        javaString getId()
        Color getColor()
        ApolloBlockLocation getLocation()
        AutoTextHotkeyModule class: com.lunarclient.apollo.module.autotexthotkey
        Public Methods
        javaboolean isClientNotify() (overrides)
        ApolloListener interface: com.lunarclient.apollo.event
        Interface Methods
        javadefault <T extends Event> void handle(Class<T> event, Consumer<T> consumer)
        EVENTS YOU CAN LISTEN TO:
        ApolloPlayerHandshakeEvent class: com.lunarclient.apollo.event.player
        Public Methods
        javaApolloPlayer getPlayer()
        MinecraftVersion getMinecraftVersion()
        LunarClientVersion getLunarClientVersion()
        List<LunarClientMod> getInstalledMods()
        TebexEmbeddedCheckoutSupport getTebexEmbeddedCheckoutSupport()
        ApolloRegisterPlayerEvent class: com.lunarclient.apollo.event.player
        Public Methods
        javaApolloPlayer getPlayer()
        ApolloUnregisterPlayerEvent class: com.lunarclient.apollo.event.player
        Public Methods
        javaApolloPlayer getPlayer()
        ApolloPlayerChatCloseEvent class: com.lunarclient.apollo.event.packetenrichment.chat
        Public Methods
        javalong getInstantiationTimeMs()
        PlayerInfo getPlayerInfo()
        ApolloPlayerChatOpenEvent class: com.lunarclient.apollo.event.packetenrichment.chat
        Public Methods
        javalong getInstantiationTimeMs()
        PlayerInfo getPlayerInfo()
        ApolloPlayerAttackEvent class: com.lunarclient.apollo.event.packetenrichment.melee
        Public Methods
        javalong getInstantiationTimeMs()
        PlayerInfo getTargetInfo()
        PlayerInfo getAttackerInfo()
        double getDistance()
        ApolloPlayerUseItemEvent class: com.lunarclient.apollo.event.packetenrichment.world
        Public Methods
        javalong getInstantiationTimeMs()
        PlayerInfo getPlayerInfo()
        boolean isMainHand()
        ApolloUpdateOptionEvent class: com.lunarclient.apollo.event.option
        Public Methods
        javaOptions getContainer()
        @Nullable ApolloPlayer getPlayer()
        Option<?, ?, ?> getOption()
        @Nullable Object getValue()
        boolean isCancelled() (overrides)
        void setCancelled(boolean cancelled) (overrides)
        Enumerations
        TitleType enum: com.lunarclient.apollo.module.title
        TITLE
        SUBTITLE
        StaffMod enum: com.lunarclient.apollo.module.staffmod
        XRAY
        TebexEmbeddedCheckoutSupport enum: com.lunarclient.apollo.module.tebex
        OVERLAY
        WINDOW
        UNSUPPORTED
        BodyPart enum: com.lunarclient.apollo.module.limb
        HEAD
        TORSO
        LEFT_ARM
        RIGHT_ARM
        LEFT_LEG
        RIGHT_LEG
        ArmorPiece enum: com.lunarclient.apollo.module.limb
        HELMET
        CHESTPLATE
        LEGGINGS
        BOOTS
        Nested Classes
        TransferResponse.Status enum: com.lunarclient.apollo.module.transfer.TransferResponse
        ACCEPTED
        REJECTED
        PingResponse.PingData class: com.lunarclient.apollo.module.transfer.PingResponse.PingData
        Public Methods
        javaString getServerIp()
        Status getStatus()
        @Range(from = 0, to = Integer.MAX_VALUE) int getPingMillis()
        PingResponse.PingData.Status enum: com.lunarclient.apollo.module.transfer.PingResponse.PingData.Status
        SUCCESS
        TIMED_OUT
    `
};