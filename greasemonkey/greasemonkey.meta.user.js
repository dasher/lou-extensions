// ==UserScript==
// @name		lou-extensions
// @namespace	github/lou-extensions
// @description	Collection of extensions for Lord of Ultima (http://www.lordofultima.com/)
// @include		http://prodgame*.lordofultima.com/*
// @downloadURL	https://github.com/TriMoon/lou-extensions/raw/trimoon/greasemonkey/greasemonkey.user.js
// @updateURL	https://github.com/TriMoon/lou-extensions/raw/trimoon/greasemonkey/greasemonkey.meta.user.js
// @version		0.6.3.tm2
// @run-at		document_end
// @grant		GM_info
// @grant		GM_getResourceText
// @grant		GM_getResourceURL
// @icon		../icons/icon48.png
// @require		../.lib/lou-extensions.js
// @resource	qooxdoo				../compat/compat.qooxdoo.js
// @resource	lou					../compat/compat.lou.js
// @resource	greasemonkey_light	../.lib/greasemonkey.light.js
// @resource	sprintf				../.lib/sprintf-0.7-beta1.js
// @resource	bos_const									../bos/bos_const.js
// @resource	bos_LocalizedStrings						../bos/bos_LocalizedStrings.js
// @resource	bos_gui_ResourcesFillerWidget				../bos/gui/bos_gui_ResourcesFillerWidget.js
// @resource	bos_BatchResourcesFiller					../bos/bos_BatchResourcesFiller.js
// @resource	bos_ResourcesFiller							../bos/bos_ResourcesFiller.js
// @resource	bos_Server									../bos/bos_Server.js
// @resource	bos_Storage									../bos/bos_Storage.js
// @resource	bos_net_CommandManager						../bos/net/bos_net_CommandManager.js
// @resource	bos_Tweaks									../bos/bos_Tweaks.js
// @resource	bos_Main									../bos/bos_Main.js
// @resource	bos_SharestringConverter					../bos/bos_SharestringConverter.js
// @resource	bos_Utils									../bos/bos_Utils.js
// @resource	bos_CityTypes								../bos/bos_CityTypes.js
// @resource	bos_City									../bos/bos_City.js
// @resource	bos_gui_SummaryPage							../bos/gui/bos_gui_SummaryPage.js
// @resource	bos_gui_TradeOrdersPage						../bos/gui/bos_gui_TradeOrdersPage.js
// @resource	bos_gui_TradeRouteWidget					../bos/gui/bos_gui_TradeRouteWidget.js
// @resource	bos_gui_PurifyOptionsWidget					../bos/gui/bos_gui_PurifyOptionsWidget.js
// @resource	bos_gui_PurifyResourcesPage					../bos/gui/bos_gui_PurifyResourcesPage.js
// @resource	bos_gui_TradeRoutesPage						../bos/gui/bos_gui_TradeRoutesPage.js
// @resource	bos_gui_MyAlliancePage						../bos/gui/bos_gui_MyAlliancePage.js
// @resource	bos_gui_IntelligenceOptionsWidget			../bos/gui/bos_gui_IntelligenceOptionsWidget.js
// @resource	bos_gui_IntelligencePage					../bos/gui/bos_gui_IntelligencePage.js
// @resource	bos_gui_PlayerInfoPage						../bos/gui/bos_gui_PlayerInfoPage.js
// @resource	bos_gui_AllianceInfoPage					../bos/gui/bos_gui_AllianceInfoPage.js
// @resource	bos_gui_IncomingAttacksPage					../bos/gui/bos_gui_IncomingAttacksPage.js
// @resource	bos_gui_MassRecruitmentOptionsWidget		../bos/gui/bos_gui_MassRecruitmentOptionsWidget.js
// @resource	bos_gui_MassRecruitmentPage					../bos/gui/bos_gui_MassRecruitmentPage.js
// @resource	bos_gui_UnitOrdersPage						../bos/gui/bos_gui_UnitOrdersPage.js
// @resource	bos_gui_RegionPage							../bos/gui/bos_gui_RegionPage.js
// @resource	bos_gui_DungeonsPage						../bos/gui/bos_gui_DungeonsPage.js
// @resource	bos_gui_CastlesPage							../bos/gui/bos_gui_CastlesPage.js
// @resource	bos_gui_CitiesPage							../bos/gui/bos_gui_CitiesPage.js
// @resource	bos_gui_OptionsPage							../bos/gui/bos_gui_OptionsPage.js
// @resource	bos_gui_MilitaryPage						../bos/gui/bos_gui_MilitaryPage.js
// @resource	bos_gui_DefendersPage						../bos/gui/bos_gui_DefendersPage.js
// @resource	bos_gui_ExtraSummaryWidget					../bos/gui/bos_gui_ExtraSummaryWidget.js
// @resource	bos_gui_SummaryWidget						../bos/gui/bos_gui_SummaryWidget.js
// @resource	bos_gui_FoodCalculatorWidget				../bos/gui/bos_gui_FoodCalculatorWidget.js
// @resource	bos_gui_RecruitmentSpeedCalculatorWidget	../bos/gui/bos_gui_RecruitmentSpeedCalculatorWidget.js
// @resource	bos_gui_CombatCalculatorWidget				../bos/gui/bos_gui_CombatCalculatorWidget.js
// @resource	bos_ui_table_cellrenderer_Default			../bos/ui/table/cellrenderer/bos_ui_table_cellrenderer_Default.js
// @resource	bos_ui_table_cellrenderer_HumanTime			../bos/ui/table/cellrenderer/bos_ui_table_cellrenderer_HumanTime.js
// @resource	bos_ui_table_cellrenderer_ClickableLook		../bos/ui/table/cellrenderer/bos_ui_table_cellrenderer_ClickableLook.js
// @resource	bos_ui_table_cellrenderer_Resource			../bos/ui/table/cellrenderer/bos_ui_table_cellrenderer_Resource.js
// @resource	bos_ui_table_cellrenderer_FullAt			../bos/ui/table/cellrenderer/bos_ui_table_cellrenderer_FullAt.js
// @resource	bos_ui_table_Table							../bos/ui/table/bos_ui_table_Table.js
// @resource	luo_tweak_globals							../louTweak/louTweak_globals.js
// @resource	luo_tweak_LocalizedStrings					../louTweak/louTweak_LocalizedStrings.js
// @resource	luo_tweak_main								../louTweak/louTweak_main.js
// @resource	luo_tweak_queueTimesLabel					../louTweak/louTweak_queueTimesLabel.js
// @resource	luo_tweak_incomingResourcesLabel			../louTweak/louTweak_incomingResourcesLabel.js
// @resource	luo_tweak_optionsPage						../louTweak/louTweak_optionsPage.js
// @resource	luo_tweak_overlayObject						../louTweak/louTweak_overlayObject.js
// @resource	luo_tweak_layoutWindow						../louTweak/louTweak_layoutWindow.js
// @resource	luo_tweak_miniMap							../louTweak/louTweak_miniMap.js
// @resource	luo_tweak_checkIfLoaded						../louTweak/louTweak_checkIfLoaded.js
// @author		https://github.com/ConanLoxley
// @author		https://github.com/TriMoon
// ==/UserScript==
