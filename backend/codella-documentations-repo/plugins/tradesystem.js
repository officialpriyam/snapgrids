module.exports = {
    name: 'TradeSystem',
    description: 'Create a trade gui with players and trade items.',
    pluginId: 'TradeSystem',
    mavenIntegration: `
        <repositories>
            <repository>
              <id>jitpack.io</id>
              <url>https://jitpack.io</url>
            </repository>
        </repositories>
        <dependencies>
            <dependency>  
              <groupId>com.github.CodingAir</groupId>
              <artifactId>TradeSystem</artifactId>  
              <version>v2.6.2</version>  
            </dependency>
            
            <dependency>
                <groupId>com.github.CodingAir</groupId>
                <artifactId>CodingAPI</artifactId>
                <version>1.84</version>
                <scope>provided</scope>
            </dependency>
        </dependencies>
    `,
    mavenShade: `
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-shade-plugin</artifactId>
            <version>3.2.3</version>
        
            <configuration>
                <relocations>
                    <relocation>
                        <pattern>de.codingair.codingapi</pattern>
                        <shadedPattern>de.codingair.tradesystem.lib.codingapi</shadedPattern>
                    </relocation>
                </relocations>
            </configuration>
        
            <executions>
                <execution>
                    <phase>package</phase>
                    <goals>
                        <goal>shade</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    `,
    code_implementation: `
        Trade abstract class: de.codingair.tradesystem.spigot.trade
        Constructors
        
        Trade(String player0, String player1, boolean initiationServer)
        
        Abstract Methods
        
        void initializeGUIs() (Initialize trading GUIs for all participants)
        void createGUIs() (Create trading GUIs for all participants)
        void startGUIs() (Open trading GUIs for all participants)
        @Nullable Player getPlayer(@NotNull Perspective perspective) (Note: Player with id=0 is never null)
        @NotNull String getWorld(@NotNull Perspective perspective) (Get world name of player with given perspective)
        @Nullable String getServer(@NotNull Perspective perspective) (Get server name of player with given perspective)
        @NotNull UUID getUniqueId(@NotNull Perspective perspective) (Get UUID of player with given perspective)
        void clearOpenAnvils() (Avoid moving the item which will be renamed into the players inventory)
        boolean isActive() (True if the trade is still active)
        boolean isPaused() (True if the trade is paused to allow closing inventory without cancelling)
        boolean isInitiator(@NotNull Perspective perspective) (True if the perspective is the initiator of the trade)
        @NotNull PlayerInventory getPlayerInventory(@NotNull Perspective perspective) (Get inventory including current cursor)
        void synchronizePlayerInventory(@NotNull Perspective perspective) (Synchronizes inventory to prepare for checking item overflow)
        @Nullable ItemStack removeReceivedItem(@NotNull Perspective perspective, int slotId) (Get item to receive from given slot)
        @NotNull CompletableFuture<Boolean> canFinish() (Check if trade can be finished on both sides)
        void onItemPickUp(@NotNull Perspective perspective) (Handle item pickup event for checking overflow)
        void updateDisplayItem(@NotNull Perspective perspective, int slotId, @Nullable ItemStack item) (Update display item on right side)
        @Nullable ItemStack getCurrentOfferedItem(@NotNull Perspective perspective, int slotId) (Get currently offered item on left side)
        @Nullable ItemStack getCurrentDisplayedItem(@NotNull Perspective perspective, int slotId) (Get currently displayed item on right side)
        @NotNull CompletableFuture<Void> markAsInitialized() (Mark trade ready for packets - returns future to continue)
        @NotNull Stream<Player> getParticipants() (Get players participating in trade)
        void onReadyStateChange(@NotNull Perspective perspective, boolean ready) (Handle ready state changes)
        
        Public Methods
        
        void onTradeOfferChange(boolean invokeTradeUpdate) (Called when an offer has changed)
        void subscribe(@NotNull Runnable runnable) (Register runnables executed when trade is updated)
        void unsubscribe(@NotNull Runnable runnable) (Unregister update runnables)
        void update() (Update displayed items and start countdown if both players ready)
        void updateLater(long delay) (Update trade after specified ticks)
        void updateLater() (Update trade in next tick)
        void cancelItemOverflow(@NotNull Perspective perspective) (Balance items to make them fit in trade partner inventory)
        boolean fitsTrade(@NotNull Perspective perspective, @NotNull List<Integer> avoid, @NotNull Collection<ItemStack> items) (Check if items fit in trade partner inventory excluding avoid slots)
        boolean fitsTrade(@NotNull Perspective from, @NotNull Collection<ItemStack> items) (Check if items fit in trade partner inventory)
        boolean doesNotFit(@NotNull Perspective from, @NotNull ItemStack item) (Check if item doesn't fit in trade partner inventory)
        boolean doesNotFit(@NotNull Perspective from, @NotNull List<Integer> avoid, @NotNull ItemStack item) (Check if item doesn't fit excluding avoid slots)
        static int checkItemFit(@NotNull Player player, @NotNull ItemStack item) (Check amount that doesn't fit in player inventory)
        void synchronizeTradeIcon(@NotNull Perspective from, @NotNull TradeIcon icon, boolean updateIcon) (Synchronize trade icon state)
        void handleClickResult(@NotNull TradeIcon tradeIcon, @NotNull Perspective perspective, @NotNull Perspective viewer, @NotNull GUI gui, @NotNull IconResult result) (Handle trade icon click results)
        void cancel() (Cancel the trade)
        void cancel(@Nullable String message) (Cancel trade with message)
        void cancel(@Nullable String message, boolean alreadyCalled) (Cancel trade with message and call state)
        boolean dropItem(Player player, ItemStack itemStack) (Drop item for player)
        @NotNull Perspective getPerspective(@NotNull Player player) (Get perspective of player)
        @NotNull Perspective getPerspective(@NotNull String player) (Get perspective of player by name)
        @NotNull UUID getUniqueId(@NotNull String player) (Get UUID of player by name)
        List<Integer> getSlots() (Get trade slots)
        List<Integer> getOtherSlots() (Get other player's slots)
        UniversalRunnable getCountdown() (Get current countdown runnable)
        int getCountdownTicks() (Get countdown tick count)
        String getOther(String p) (Get other player's name)
        TradeLayout[] getLayout() (Get trade layouts)
        boolean[] getPause() (Get pause states)
        TradingGUI[] getGUIs() (Get trading GUIs)
        boolean inMainGUI(Player player) (Check if player is in main GUI)
        void acknowledgeGuiSwitch(@NotNull Player player) (Acknowledge GUI switch - fixes dupe glitch)
        boolean isInitiationServer() (Check if this is the initiation server)
        String[] getNames() (Get player names)
        boolean isCancelling() (Check if trade is being cancelled)
        boolean[] getReady() (Get ready states)
        @NotNull Stream<Player> getViewers() (Get players currently viewing this trade)
        
        Protected Methods
        
        void start() (Start the trade process)
        void buildPattern() (Build the trade pattern)
        boolean tryFinish(@NotNull Perspective perspective) (Simulate trade icon exchanges)
        @NotNull CompletableFuture<Boolean> finish() (Finish the trade)
        @NotNull CompletableFuture<Void> runCountdown() (Run the countdown process)
        boolean exchangeItems(@NotNull Perspective perspective, boolean initiator) (Exchange items between players)
        void exchangeOtherGoods(@NotNull Perspective perspective) (Exchange non-item goods)
        void cancelling(@Nullable String message) (Handle cancellation process)
        @Nullable ItemStack callTradeItemEvent(@NotNull Player receiver, @Nullable Player sender, @NotNull String senderName, @Nullable ItemStack item) (Call trade item event)
        void informTransition(@NotNull TradeIcon from, @NotNull Perspective to) (Inform transition between trade icons)
        void updateStatusIcon(@NotNull Perspective perspective) (Update status icon for player)
        void synchronizeTitle() (Synchronize GUI titles)
        void closeInventories() (Close all trade inventories)
        void playCountDownStopSound() (Play countdown stop sound)
        void playStartSound() (Play trade start sound)
        void playCancelSound() (Play trade cancel sound)
        @NotNull Optional<Player> getPlayerOpt(@NotNull Perspective perspective) (Get optional player by perspective)
        void sendMessage(@NotNull Perspective perspective, @NotNull String message) (Send message to player)
        @NotNull String getPlaceholderMessage(@NotNull Perspective perspective, @NotNull String message) (Get placeholder message)
        
        TradeResult class: de.codingair.tradesystem.spigot.trade
        Constructors
        
        TradeResult(@NotNull UUID playerId, @NotNull String playerWorld, @Nullable String playerServer, @NotNull Perspective perspective)
        
        Public Methods
        
        @NotNull UUID getPlayerId() (Get ID of player who received the result)
        @NotNull String getPlayerWorld() (Get world name of player who received the result)
        @Nullable String getPlayerServer() (Get server name if this was a proxy trade)
        @NotNull Perspective getPerspective() (Get perspective of player who received the result)
        @NotNull @Unmodifiable List<ItemStack> getReceivingItems() (Get all items received during exchange)
        @NotNull @Unmodifiable List<ItemStack> getSendingItems() (Get all items sent during exchange)
        @NotNull @Unmodifiable List<EconomyIcon<?>> getEconomyIcons() (Get all economy icons that were exchanged - modifying values affects trades)
        
        Package-Private Methods
        
        void add(@Nullable ItemStack item, boolean receive) (Add item to result)
        void add(@Nullable TradeIcon icon) (Add trade icon to result)
    
    
        TradeSystem Event Classes
        TradeFinishEvent class: de.codingair.tradesystem.spigot.events
        Constructors
        
        TradeFinishEvent(@NotNull String sender, @NotNull UUID senderId, @NotNull Player receiver, boolean tradeResult, @NotNull TradeResult @NotNull [] results) (proxy trade - receiving player server)
        TradeFinishEvent(@NotNull Player sender, @NotNull String receiver, @NotNull UUID receiverId, boolean tradeResult, @NotNull TradeResult @NotNull [] results) (proxy trade - sending player server)
        TradeFinishEvent(@NotNull Player sender, @NotNull Player receiver, boolean tradeResult, @NotNull TradeResult @NotNull [] results) (bukkit trade)
        
        Static Methods
        
        static HandlerList getHandlerList()
        
        Public Methods
        
        @NotNull HandlerList getHandlers() (overrides)
        @Nullable Player getSendingPlayer()
        @NotNull String getSender()
        @NotNull UUID getSenderId()
        @Nullable Player getReceivingPlayer()
        @NotNull String getReceiver()
        @NotNull UUID getReceiverId()
        boolean isProxyTrade()
        boolean getTradeResult()
        @NotNull TradeResult getSendingPlayerResult()
        @NotNull TradeResult getReceivingPlayerResult()
        
        TradeOfferItemEvent class: de.codingair.tradesystem.spigot.events (Called when a player offers an item - can be cancelled to block the item)
        Constructors
        
        TradeOfferItemEvent(@NotNull Player player, @NotNull String receiver, @NotNull UUID receiverId, @NotNull ItemStack itemStack, boolean cancelled) (proxy trade)
        TradeOfferItemEvent(@NotNull Player player, @NotNull Player receivingPlayer, @NotNull ItemStack itemStack, boolean cancelled) (bukkit trade)
        
        Static Methods
        
        static HandlerList getHandlerList()
        
        Public Methods
        
        @NotNull HandlerList getHandlers() (overrides)
        @NotNull Player getPlayer()
        @NotNull String getReceiver()
        @NotNull UUID getReceiverId()
        @Nullable Player getReceivingPlayer()
        boolean isProxyTrade()
        @NotNull ItemStack getItemStack()
        boolean isCancelled() (overrides)
        void setCancelled(boolean cancelled) (overrides)
        
        TradeReceiveEconomyEvent class: de.codingair.tradesystem.spigot.events (Called when a player receives economy from another player after trade completion)
        Constructors
        
        TradeReceiveEconomyEvent(@NotNull Player receiver, @NotNull String sender, @NotNull UUID senderId, @NotNull BigDecimal balance, @NotNull String nameSingular, @NotNull String namePlural) (proxy trade)
        TradeReceiveEconomyEvent(@NotNull Player receiver, @NotNull Player sendingPlayer, @NotNull BigDecimal balance, @NotNull String nameSingular, @NotNull String namePlural) (bukkit trade)
        
        Static Methods
        
        static HandlerList getHandlerList()
        
        Public Methods
        
        @NotNull HandlerList getHandlers() (overrides)
        @NotNull Player getReceiver()
        @NotNull String getSender()
        @NotNull UUID getSenderId()
        @Nullable Player getSendingPlayer()
        boolean isProxyTrade()
        @NotNull BigDecimal getBalance()
        @NotNull String getNameSingular()
        @NotNull String getNamePlural()
        
        TradeReportEvent class: de.codingair.tradesystem.spigot.events (Called when a player receives items/goods after trade completion - can control trade report)
        Constructors
        
        TradeReportEvent(@NotNull Player receiver, @NotNull String other, @NotNull UUID otherId, @NotNull PlayerTradeResult result) (proxy trade)
        TradeReportEvent(@NotNull Player receiver, @NotNull Player otherPlayer, @NotNull PlayerTradeResult result) (bukkit trade)
        
        Static Methods
        
        static HandlerList getHandlerList()
        
        Public Methods
        
        @NotNull HandlerList getHandlers() (overrides)
        @NotNull Player getReceiver()
        @Nullable Player getOtherPlayer()
        @NotNull String getOther()
        @NotNull UUID getOtherId()
        boolean isProxyTrade()
        @NotNull PlayerTradeResult getResult()
        @Nullable List<String> getItemReport()
        void setItemReport(@Nullable List<String> itemReport)
        @Nullable List<String> getEconomyReport()
        void setEconomyReport(@Nullable List<String> economyReport)
        boolean isPlayFinishSound()
        void setPlayFinishSound(boolean playFinishSound)
        boolean isCancelled() (overrides)
        void setCancelled(boolean cancel) (overrides)
        
        TradeRequestEvent class: de.codingair.tradesystem.spigot.events (Called when a player requests a trade - only fired if sender doesn't violate rules)
        Constructors
        
        TradeRequestEvent(@NotNull String sender, @NotNull UUID senderId, @NotNull Player receiver, int expiresIn) (proxy trade - receiving player server)
        TradeRequestEvent(@NotNull Player sender, @NotNull String receiver, @NotNull UUID receiverId, int expiresIn) (proxy trade - sending player server)
        TradeRequestEvent(@NotNull Player sender, @NotNull Player receiver, int expiresIn) (bukkit trade)
        
        Static Methods
        
        static HandlerList getHandlerList()
        
        Public Methods
        
        @NotNull HandlerList getHandlers() (overrides)
        @Nullable Player getSendingPlayer()
        @NotNull String getSender()
        @NotNull UUID getSenderId()
        @Nullable Player getReceivingPlayer()
        @NotNull String getReceiver()
        @NotNull UUID getReceiverId()
        boolean isProxyTrade()
        boolean isCancelled() (overrides)
        void setCancelled(boolean cancelled) (overrides)
        int getExpiresIn()
        
        TradeRequestPreResponseEvent class: de.codingair.tradesystem.spigot.events (Called when a player is about to respond to a trade request)
        Constructors
        
        TradeRequestPreResponseEvent(@NotNull String sender, @NotNull UUID senderId, @Nullable Player sendingPlayer, @NotNull String receiver, @NotNull UUID receiverId, @Nullable Player receivingPlayer, boolean accepted)
        
        Static Methods
        
        static HandlerList getHandlerList()
        
        Public Methods
        
        @NotNull HandlerList getHandlers() (overrides)
        @NotNull String getSender()
        @NotNull UUID getSenderId()
        @Nullable Player getSendingPlayer()
        @NotNull String getReceiver()
        @NotNull UUID getReceiverId()
        @Nullable Player getReceivingPlayer()
        boolean isProxyTrade()
        boolean isAccepted()
        boolean isCancelled() (overrides)
        void setCancelled(boolean cancelled) (overrides)
        
        TradeIconInitializeEvent class: de.codingair.tradesystem.spigot.events (Called during onEnable before loading trade layouts - allows registering custom TradeIcons)
        Constructors
        
        TradeIconInitializeEvent(@NotNull BiConsumer<Class<? extends TradeIcon>, EditorInfo> registry)
        
        Static Methods
        
        static HandlerList getHandlerList()
        
        Public Methods
        
        @NotNull HandlerList getHandlers() (overrides)
        void registerIcon(@NotNull JavaPlugin plugin, @NotNull Class<? extends TradeIcon> icon, @NotNull EditorInfo info)
        void registerIcon(@NotNull JavaPlugin plugin, @NotNull Class<? extends TradeIcon> icon, @NotNull TransitionTargetEditorInfo info)
        
        TradeItemEvent class: de.codingair.tradesystem.spigot.events (Called when a player trades an item with another player)
        Constructors
        
        TradeItemEvent(@NotNull Player receiver, @NotNull String sender, @NotNull UUID senderId, @NotNull ItemStack item) (proxy trade)
        TradeItemEvent(@NotNull Player receiver, @NotNull Player sendingPlayer, @NotNull ItemStack item) (bukkit trade)
        
        Static Methods
        
        static HandlerList getHandlerList()
        
        Public Methods
        
        @NotNull HandlerList getHandlers() (overrides)
        @NotNull Player getReceiver()
        @NotNull String getSender()
        @NotNull UUID getSenderId()
        @Nullable Player getSendingPlayer()
        boolean isProxyTrade()
        @NotNull ItemStack getItem()
        void setItem(@Nullable ItemStack item)
        boolean isAboutToDrop()
        
        TradeCountdownEvent class: de.codingair.tradesystem.spigot.events (Called on each countdown tick when finishing a trade - allows modifying open inventories)
        Constructors
        
        TradeCountdownEvent(@NotNull Trade trade, @NotNull Perspective perspective, @NotNull Player viewer, @NotNull Inventory openInventory, int intervals, int intervalTickDuration, int remainingIntervals)
        
        Static Methods
        
        static HandlerList getHandlerList()
        
        Public Methods
        
        @NotNull HandlerList getHandlers() (overrides)
        @NotNull Trade getTrade()
        @NotNull Perspective getPerspective()
        @NotNull Player getViewer()
        @NotNull Inventory getOpenInventory()
        int getIntervals()
        int getIntervalTickDuration()
        int getRemainingIntervals()
        
        TradeLogReceiveItemEvent class: de.codingair.tradesystem.spigot.events (Called when a player receives an item after trade completion)
        Constructors
        
        TradeLogReceiveItemEvent(@NotNull Player receiver, @NotNull String sender, @NotNull UUID senderId, @NotNull ItemStack item) (proxy trade)
        TradeLogReceiveItemEvent(@NotNull Player receiver, @NotNull Player sendingPlayer, @NotNull ItemStack item) (bukkit trade)
        
        Static Methods
        
        static HandlerList getHandlerList()
        
        Public Methods
        
        @NotNull HandlerList getHandlers() (overrides)
        @NotNull Player getReceiver()
        @Nullable Player getSendingPlayer()
        @NotNull String getSender()
        @NotNull UUID getSenderId()
        boolean isProxyTrade()
        @NotNull ItemStack getItem()
        @Nullable String getMessage()
        void setMessage(@Nullable String message)
        
        TradePatternRegistrationEvent class: de.codingair.tradesystem.spigot.events (Called during onEnable when loading trade layouts - allows registering custom trade layouts)
        Constructors
        
        TradePatternRegistrationEvent()
        
        Static Methods
        
        static HandlerList getHandlerList()
        
        Public Methods
        
        @NotNull HandlerList getHandlers() (overrides)
        void addPattern(@NotNull Pattern pattern)
        @NotNull @Unmodifiable Set<Pattern> getPatterns()
        
        TradeRequestExpireEvent class: de.codingair.tradesystem.spigot.events (Called when a trade request expires)
        Constructors
        
        TradeRequestExpireEvent(@NotNull String sender, @NotNull UUID senderId, @Nullable Player sendingPlayer, @NotNull String receiver, @NotNull UUID receiverId, @Nullable Player receivingPlayer)
        
        Static Methods
        
        static HandlerList getHandlerList()
        
        Public Methods
        
        @NotNull HandlerList getHandlers() (overrides)
        @NotNull String getSender()
        @NotNull UUID getSenderId()
        @Nullable Player getSendingPlayer()
        @NotNull String getReceiver()
        @NotNull UUID getReceiverId()
        @Nullable Player getReceivingPlayer()
        boolean isProxyTrade()
        
        TradeRequestResponseEvent class: de.codingair.tradesystem.spigot.events (Called when a trade request is accepted or declined)
        Constructors
        
        TradeRequestResponseEvent(@NotNull String sender, @NotNull UUID senderId, @Nullable Player sendingPlayer, @NotNull String receiver, @NotNull UUID receiverId, @Nullable Player receivingPlayer, boolean accepted)
        
        Static Methods
        
        static HandlerList getHandlerList()
        
        Public Methods
        
        @NotNull HandlerList getHandlers() (overrides)
        @NotNull String getSender()
        @NotNull UUID getSenderId()
        @Nullable Player getSendingPlayer()
        @NotNull String getReceiver()
        @NotNull UUID getReceiverId()
        @Nullable Player getReceivingPlayer()
        boolean isProxyTrade()
        boolean isAccepted()
        
        TradeToggleEvent class: de.codingair.tradesystem.spigot.events (Called when a player toggles their trade request status)
        Constructors
        
        TradeToggleEvent(@NotNull UUID playerUUID, @NotNull String playerName, boolean status)
        
        Static Methods
        
        static HandlerList getHandlerList()
        
        Public Methods
        
        @NotNull HandlerList getHandlers() (overrides)
        @NotNull String getPlayerName()
        @NotNull UUID getPlayerUUID()
        boolean getStatus()
        
        TradeSystem Core Interfaces
        TradeIcon interface: de.codingair.tradesystem.spigot.trade.gui.layout.types
        Interface Methods
        
        @NotNull Button getButton(@NotNull Trade trade, @NotNull Perspective perspective, @NotNull Player viewer)
        void onFinish(@NotNull Trade trade, @NotNull Perspective perspective, @NotNull Player viewer, boolean initiationServer)
        @NotNull FinishResult tryFinish(@NotNull Trade trade, @NotNull Perspective perspective, @NotNull Player viewer, boolean initiationServer)
        boolean isEmpty()
        void serialize(@NotNull DataOutputStream out)
        void deserialize(@NotNull DataInputStream in)
        
        Default Methods
        
        void updateItem(@NotNull Trade trade, @NotNull Perspective perspective)
        void updateButton(@NotNull Trade trade, @NotNull Player player)
        void log(@NotNull Trade trade, @NotNull TradeLog.Message message, Object... vars)
    `
};