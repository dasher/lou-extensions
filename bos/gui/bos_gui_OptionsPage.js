/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:35
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.gui.OptionsPage");

    qx.Class.define("bos.gui.OptionsPage", {
        extend: qx.ui.tabview.Page,
        construct: function() {
            qx.ui.tabview.Page.call(this);
            this.setLabel(tr("options"));
            this.setLayout(new qx.ui.layout.Dock());

            var scrollable = new qx.ui.container.Scroll();
            this.add(scrollable);

            var scroll = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
            scrollable.add(scroll);

            var container;

            container = new qx.ui.groupbox.GroupBox(tr("table settings"));
            container.setLayout(new qx.ui.layout.Flow(10, 10));
            scroll.add(container);

            var storage = bos.Storage.getInstance();

            this.cbLoadTableSettingsAtStart = new qx.ui.form.CheckBox(tr("load table settings at start"));
            this.cbLoadTableSettingsAtStart.setValue(bos.Storage.getInstance().getLoadTableSettingsAtStart());
            this.cbLoadTableSettingsAtStart.addListener("execute", function(event) {
                storage.setLoadTableSettingsAtStart(this.cbLoadTableSettingsAtStart.getValue());
                storage.saveOptions();
            }, this);
            container.add(this.cbLoadTableSettingsAtStart);

            this.sbTableName = new qx.ui.form.SelectBox().set({
                width: 120,
                height: 28
            });
            this.sbTableName.setToolTipText(tr("table name"));
            this.sbTableName.add(new qx.ui.form.ListItem(tr("cities"), null, "cities"));
            this.sbTableName.add(new qx.ui.form.ListItem(tr("Military"), null, "military"));
            this.sbTableName.add(new qx.ui.form.ListItem(tr("purify resources"), null, "moonstones"));
            container.add(this.sbTableName);

            var btnLoadTableSettings = new qx.ui.form.Button(tr("btnLoadTableSettings"));
            btnLoadTableSettings.setToolTipText(tr("btnLoadTableSettings_toolTip"));
            btnLoadTableSettings.setWidth(140);
            container.add(btnLoadTableSettings);
            btnLoadTableSettings.addListener("execute", function(evt) {
                var tableName = this.sbTableName.getSelection()[0].getModel();
                var storage = bos.Storage.getInstance();
                var tbl = null;
                var settings = null;
                var summary = getSummaryWidget();
                switch (tableName) {
                    case "cities":
                        tbl = summary.citiesTab.table;
                        settings = storage.getCitiesTableSettings();
                        break;
                    case "military":
                        tbl = summary.militaryTab.table;
                        settings = storage.getMilitaryTableSettings();
                        break;
                    case "moonstones":
                        tbl = summary.moonstonesTable;
                        settings = storage.getMoonstonesTableSettings();
                        break;
                }
                if (tbl != null && settings != null) {
                    tbl.applyTableSettings(settings, tableName);
                    storage.saveOptions();
                }

            }, this);

            var btnSaveTableSettings = new qx.ui.form.Button(tr("btnSaveTableSettings"));
            btnSaveTableSettings.setToolTipText(tr("btnSaveTableSettings_toolTip"));
            btnSaveTableSettings.setWidth(140);
            container.add(btnSaveTableSettings);
            btnSaveTableSettings.addListener("execute", function(evt) {
                var tableName = this.sbTableName.getSelection()[0].getModel();
                var tbl = null;
                var summary = getSummaryWidget();
                switch (tableName) {
                    case "cities":
                        tbl = summary.citiesTab.table;
                        break;
                    case "military":
                        tbl = summary.militaryTab.table;
                        break;
                    case "moonstones":
                        tbl = summary.moonstonesTable;
                        break;
                }
                if (tbl != null) {
                    tbl.saveTableSettings(tableName);
                    storage.saveOptions();
                }
            }, this);

            container = new qx.ui.groupbox.GroupBox(tr("saving cities data"));
            container.setLayout(new qx.ui.layout.Flow(10, 10));
            scroll.add(container);

            this.cbPersistCities = new qx.ui.form.CheckBox(tr("cbPersistCities"));
            this.cbPersistCities.setToolTipText(tr("cbPersistCities_toolTip"));
            this.cbPersistCities.setValue(storage.getPersistingCitiesEnabled());
            this.cbPersistCities.addListener("execute", function(event) {
                bos.Storage.getInstance().setPersistingCitiesEnabled(this.cbPersistCities.getValue());
                storage.saveOptions();
            }, this);
            container.add(this.cbPersistCities);

            this.cbLoadPersistedCitiesAtStart = new qx.ui.form.CheckBox(tr("cbLoadPersistedCitiesAtStart"));
            this.cbLoadPersistedCitiesAtStart.setValue(storage.getLoadPersistedCitiesAtStart());
            this.cbLoadPersistedCitiesAtStart.addListener("execute", function(event) {
                storage.setLoadPersistedCitiesAtStart(this.cbLoadPersistedCitiesAtStart.getValue());
                storage.saveOptions();
            }, this);
            container.add(this.cbLoadPersistedCitiesAtStart);

            var btnLoadCities = new qx.ui.form.Button(tr("btnLoadCities"));
            btnLoadCities.setToolTipText("btnLoadCities_toolTip");
            btnLoadCities.setWidth(220);
            btnLoadCities.addListener("execute", this.loadPersistedCities, this);
            container.add(btnLoadCities);

            var btnDeleteAllSavedData = new qx.ui.form.Button(tr("btnDeleteAllSavedData"));
            btnDeleteAllSavedData.addListener("execute", function(event) {
                storage.getInstance().deleteAllSavedData();
                bos.Utils.handleInfo(tr("btnDeleteAllSavedData_confirmation"));
            }, this);
            container.add(btnDeleteAllSavedData);

            var btnSaveAllCities = new qx.ui.form.Button(tr("btnSaveAllCities"));
            btnSaveAllCities.addListener("execute", function(event) {
                var server = bos.Server.getInstance();
                server.persistAllPendingCities();
            }, this);
            container.add(btnSaveAllCities);

            var btnPersistHelp = new qx.ui.form.Button(tr("help"));
            btnPersistHelp.addListener("execute", function(event) {
                var dialog = new webfrontend.gui.ConfirmationWidget();
                dialog.showGenericNotice(tr("help"), tr("persistHelp"), "", "webfrontend/ui/bgr_popup_survey.gif");
                qx.core.Init.getApplication().getDesktop().add(dialog, {left: 0, right: 0, top: 0, bottom: 0});
                dialog.show();
            }, this);
            btnPersistHelp.setWidth(60);
            container.add(btnPersistHelp);

            container = new qx.ui.groupbox.GroupBox(locale == "de" ? "Eigene Stadt-Typen" : "Custom City Types");
            container.setLayout(new qx.ui.layout.Flow(10, 10));
            scroll.add(container);
            this.sbCustomCityTypes = new qx.ui.form.SelectBox().set({
                width: 120,
                height: 28
            });
            this.sbCustomCityTypes.setToolTipText(locale == "de" ? "Eigene Stadt-Typen" : "Custom City Types");
            container.add(this.sbCustomCityTypes);
            this._populateCustomCityTypes();

            var btnAddCustomCityType = new qx.ui.form.Button(locale == "de" ? "Hinzufügen" :"Add");
            btnAddCustomCityType.addListener("execute", this._addCustomCityType, this);
            container.add(btnAddCustomCityType);

            var btnRemoveCustomCityType = new qx.ui.form.Button(locale == "de" ? "Löschen" :"Remove");
            btnRemoveCustomCityType.addListener("execute", this._removeCustomCityType, this);
            container.add(btnRemoveCustomCityType);

            container = new qx.ui.groupbox.GroupBox(tr("city types to city groups copier"));
            container.setLayout(new qx.ui.layout.Flow(10, 10));
            scroll.add(container);
            this.sbCityType = bos.Utils.createCitiesTypesSelectBox();
            bos.Utils.populateCitiesTypesSelectBox(this.sbCityType, false, true);
            bos.Storage.getInstance().addListener("changeCustomCityTypesVersion", function(event) {
                bos.Utils.populateCitiesTypesSelectBox(this.sbCityType, false, true);
            }, this);
            container.add(this.sbCityType);
            this.sbCityGroup = bos.Utils.createCitiesGroupsSelectBox();
            bos.Utils.populateCitiesGroupsSelectBox(this.sbCityGroup);
            webfrontend.data.Player.getInstance().addListener("changedCityGroups", function(event) {
                bos.Utils.populateCitiesGroupsSelectBox(this.sbCityGroup);
            }, this);
            container.add(this.sbCityGroup);
            var btnCopyCityType2Group = new qx.ui.form.Button(tr("btnCopyCityType2Group"));
            btnCopyCityType2Group.setToolTipText(tr("btnCopyCityType2Group_toolTip"));
            btnCopyCityType2Group.addListener("execute", this._copyCityType2Group, this);
            container.add(btnCopyCityType2Group);

            container = new qx.ui.groupbox.GroupBox(locale == "de" ? "Chat" : "Chat");
            container.setLayout(new qx.ui.layout.Flow(10, 10));
            scroll.add(container);

            this.cbTweakChatAtStart = new qx.ui.form.CheckBox(locale == "de" ? "Tweak chat at start" : "Tweak chat at start");
            this.cbTweakChatAtStart.setToolTipText("When option is checked chat is tweaked at start");
            this.cbTweakChatAtStart.setValue(bos.Storage.getInstance().getTweakChatAtStart());
            this.cbTweakChatAtStart.addListener("execute", function(event) {
                storage.setTweakChatAtStart(this.cbTweakChatAtStart.getValue());
                storage.saveOptions();
            }, this);
            container.add(this.cbTweakChatAtStart);

            var btnTweakChat = new qx.ui.form.Button("Tweak chat");
            btnTweakChat.addListener("execute", function(event) {
                bos.Tweaks.getInstance().tweakChat();
                btnTweakChat.hide();
            }, this);
            container.add(btnTweakChat);

            container = new qx.ui.groupbox.GroupBox(locale == "de" ? "Sonstiges" : "Other");
            container.setLayout(new qx.ui.layout.Flow(10, 10));
            scroll.add(container);
            /*
             this.cbTweakReportAtStart = new qx.ui.form.CheckBox(tr("cbTweakReportAtStart"));
             this.cbTweakReportAtStart.setToolTipText(tr("cbTweakReportAtStart_toolTip"));
             this.cbTweakReportAtStart.setValue(bos.Storage.getInstance().getTweakReportAtStart());
             this.cbTweakReportAtStart.addListener("execute", function(event) {
             storage.setTweakReportAtStart(this.cbTweakReportAtStart.getValue());
             storage.saveOptions();
             }, this);
             container.add(this.cbTweakReportAtStart);

             var btnTweakReports = new qx.ui.form.Button("Tweak reports");
             btnTweakReports.setToolTipText("Tweaks reports, it may not work when EA will publish next patch. That's the reason why it's not automatic like in previous versions");
             btnTweakReports.addListener("execute", function(event) {
             bos.Tweaks.getInstance().tweakReports();
             }, this);
             container.add(btnTweakReports);
             */
            var btnSaveSummaryPosition = new qx.ui.form.Button(tr("save summary position"));
            btnSaveSummaryPosition.addListener("execute", function(event) {
                var storage = bos.Storage.getInstance();
                var summary = getSummaryWidget();
                var props = summary.getLayoutProperties();
                var pos = {
                    left: props.left,
                    top: props.top,
                    width: summary.getWidth(),
                    height: summary.getHeight()
                };
                storage.setSummaryPosition(pos);
                storage.saveOptions();
            }, this);
            container.add(btnSaveSummaryPosition);
        },
        members: {
            sbCustomCityTypes: null,
            cbTweakChatAtStart: null,
            cbTweakReportAtStart: null,
            sbCityType: null,
            sbContinents: null,
            sbTableName: null,
            cbPersistCities: null,
            cbLoadPersistedCitiesAtStart: null,
            btnRefreshResources: null,
            cbLoadTableSettingsAtStart: null,
            sbCityGroup: null,
            _progressDialog: null,
            _disposeProgressDialog: function() {
                if (this._progressDialog != null) {
                    this._progressDialog.disable();
                    this._progressDialog.destroy();
                    this._progressDialog = null;
                }
            },
            _copyCityType2Group: function() {
                if (this.sbCityType.getSelection() == null || this.sbCityGroup.getSelection() == null) {
                    alert(tr("please select both city type and city group"));
                    return;
                }
                var cityType = this.sbCityType.getSelection()[0].getModel();
                var cityGroup = this.sbCityGroup.getSelection()[0].getModel();
                cityGroup = parseInt(cityGroup.substring(2));

                var player = webfrontend.data.Player.getInstance();
                var cities = player.cities;
                for (var key in cities) {
                    var c = cities[key];

                    if (!bos.Utils.shouldCityBeIncluded(c, cityType, "A")) {
                        continue;
                    }

                    var groups = player.getCitysGroups(key);
                    var alreadyMemberOfGroup = false;
                    for (var i = 0, iCount = groups.length; i < iCount; i++) {
                        if (groups[i] == cityGroup) {
                            alreadyMemberOfGroup = true;
                            break;
                        }
                    }

                    if (!alreadyMemberOfGroup) {
                        groups.push(cityGroup);
                        var req = {
                            _idCityCoord: key,
                            _arrNewGroups: groups
                        };
                        bos.net.CommandManager.getInstance().sendCommand("SetCitysGroups", req, this, this._processSetCitysGroups);
                    }
                }

                var count = bos.net.CommandManager.getInstance().getNumberOfPendingCommands();
                if (count > 5) {
                    this._progressDialog = new webfrontend.gui.ConfirmationWidget();
                    this._progressDialog.showInProgressBox(tr("cities to be filled: ") + count);
                    qx.core.Init.getApplication().getDesktop().add(this._progressDialog, {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0
                    });
                    this._progressDialog.show();
                }
            },
            _processSetCitysGroups: function(isOk, result) {
                var count = bos.net.CommandManager.getInstance().getNumberOfPendingCommands();
                if (count == 0) {
                    this._disposeProgressDialog();
                } else if (this._progressDialog != null) {
                    this._progressDialog.showInProgressBox(tr("cities to be filled: ") + count);
                }
            },
            _addCustomCityType: function() {
                var letter = prompt(locale=="de"? "Bitte geb einen Buchstaben ein" : "Please enter one letter");
                if (letter == null || letter.length != 1) {
                    return;
                }
                if (bos.CityTypes.getInstance().isReservedLetter(letter)) {
                    bos.Utils.handleWarning(locale=="de"? "Dieser Buchstabe ist schon in Benutzung" : "This letter is reserved");
                    return;
                }

                var description = prompt(locale=="de"? "Bitte gebe eine Beschreibung ein" : "Please enter description");
                if (description == null || description.length == 0) {
                    return;
                }

                var storage = bos.Storage.getInstance();
                storage.addCustomCityType(letter, description);
                storage.saveOptions();

                this._populateCustomCityTypes();
            },
            _removeCustomCityType: function() {

                var sel = this.sbCustomCityTypes.getSelection();
                if (sel == null || sel.length == 0) {
                    return;
                }
                var letter = sel[0].getModel();

                var storage = bos.Storage.getInstance();
                storage.removeCustomCityType(letter);
                storage.saveOptions();

                this._populateCustomCityTypes();
            },
            _populateCustomCityTypes: function() {
                var storage = bos.Storage.getInstance();
                var list = storage.getCustomCityTypes();
                this.sbCustomCityTypes.removeAll();
                for (var i = 0; i < list.length; i++) {
                    var item = list[i];
                    this.sbCustomCityTypes.add(new qx.ui.form.ListItem(item.letter + " - " + item.description, null, item.letter));
                }
            }
        }
    });
});