//	==UserScript==
//	@name			lou-extensions
//	@namespace		https://github.com/ConanLoxley/lou-extensions
//	@description	Collection of extensions for Lord of Ultima (http://www.lordofultima.com/)
//	@include		http://prodgame*.lordofultima.com/*
//	@downloadURL	https://github.com/TriMoon/lou-extensions/raw/trimoon/greasemonkey/greasemonkey.user.js
//	@updateURL		https://github.com/TriMoon/lou-extensions/raw/trimoon/greasemonkey/greasemonkey.meta.user.js
//	@version		0.6.3.tm1
//	@run-at		document_end
//	@grant		GM_info
//	@grant		GM_getResourceText
//	@grant		GM_getResourceURL
//	@icon		icon48.png
//	@require	../.lib/lou-extensions.js
//	@require	../compat/compat.qooxdoo.js
//	@require	../compat/compat.lou.js
//	@require	../.lib/greasemonkey.light.js
//	@require	../.lib/sprintf-0.7-beta1.js
//	@resource	bos_const									../bos/const.js
//	@resource	bos_LocalizedStrings						../bos/LocalizedStrings.js
//	@resource	bos_gui_ResourcesFillerWidget				../bos/gui/ResourcesFillerWidget.js
//	@resource	bos_BatchResourcesFiller					../bos/BatchResourcesFiller.js
//	@resource	bos_ResourcesFiller							../bos/ResourcesFiller.js
//	@resource	bos_Server									../bos/Server.js
//	@resource	bos_Storage									../bos/Storage.js
//	@resource	bos_net_CommandManager						../bos/net/CommandManager.js
//	@resource	bos_Tweaks									../bos/Tweaks.js
//	@resource	bos_Main									../bos/Main.js
//	@resource	bos_SharestringConverter					../bos/SharestringConverter.js
//	@resource	bos_Utils									../bos/Utils.js
//	@resource	bos_CityTypes								../bos/CityTypes.js
//	@resource	bos_City									../bos/City.js
//	@resource	bos_gui_SummaryPage							../bos/gui/SummaryPage.js
//	@resource	bos_gui_TradeOrdersPage						../bos/gui/TradeOrdersPage.js
//	@resource	bos_gui_TradeRouteWidget					../bos/gui/TradeRouteWidget.js
//	@resource	bos_gui_PurifyOptionsWidget					../bos/gui/PurifyOptionsWidget.js
//	@resource	bos_gui_PurifyResourcesPage					../bos/gui/PurifyResourcesPage.js
//	@resource	bos_gui_TradeRoutesPage						../bos/gui/TradeRoutesPage.js
//	@resource	bos_gui_MyAlliancePage						../bos/gui/MyAlliancePage.js
//	@resource	bos_gui_IntelligenceOptionsWidget			../bos/gui/IntelligenceOptionsWidget.js
//	@resource	bos_gui_IntelligencePage					../bos/gui/IntelligencePage.js
//	@resource	bos_gui_PlayerInfoPage						../bos/gui/PlayerInfoPage.js
//	@resource	bos_gui_AllianceInfoPage					../bos/gui/AllianceInfoPage.js
//	@resource	bos_gui_IncomingAttacksPage					../bos/gui/IncomingAttacksPage.js
//	@resource	bos_gui_MassRecruitmentOptionsWidget		../bos/gui/MassRecruitmentOptionsWidget.js
//	@resource	bos_gui_MassRecruitmentPage					../bos/gui/MassRecruitmentPage.js
//	@resource	bos_gui_UnitOrdersPage						../bos/gui/UnitOrdersPage.js
//	@resource	bos_gui_RegionPage							../bos/gui/RegionPage.js
//	@resource	bos_gui_DungeonsPage						../bos/gui/DungeonsPage.js
//	@resource	bos_gui_CastlesPage							../bos/gui/CastlesPage.js
//	@resource	bos_gui_CitiesPage							../bos/gui/CitiesPage.js
//	@resource	bos_gui_OptionsPage							../bos/gui/OptionsPage.js
//	@resource	bos_gui_MilitaryPage						../bos/gui/MilitaryPage.js
//	@resource	bos_gui_DefendersPage						../bos/gui/DefendersPage.js
//	@resource	bos_gui_ExtraSummaryWidget					../bos/gui/ExtraSummaryWidget.js
//	@resource	bos_gui_SummaryWidget						../bos/gui/SummaryWidget.js
//	@resource	bos_gui_FoodCalculatorWidget				../bos/gui/FoodCalculatorWidget.js
//	@resource	bos_gui_RecruitmentSpeedCalculatorWidget	../bos/gui/RecruitmentSpeedCalculatorWidget.js
//	@resource	bos_gui_CombatCalculatorWidget				../bos/gui/CombatCalculatorWidget.js
//	@resource	bos_ui_table_cellrenderer_Default			../bos/ui/table/cellrenderer/Default.js
//	@resource	bos_ui_table_cellrenderer_HumanTime			../bos/ui/table/cellrenderer/HumanTime.js
//	@resource	bos_ui_table_cellrenderer_ClickableLook		../bos/ui/table/cellrenderer/ClickableLook.js
//	@resource	bos_ui_table_cellrenderer_Resource			../bos/ui/table/cellrenderer/Resource.js
//	@resource	bos_ui_table_cellrenderer_FullAt			../bos/ui/table/cellrenderer/FullAt.js
//	@resource	bos_ui_table_Table							../bos/ui/table/Table.js
//	==/UserScript==
