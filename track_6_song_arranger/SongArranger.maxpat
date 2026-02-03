{
	"patcher" : 	{
		"fileversion" : 1,
		"appversion" : 		{
			"major" : 8,
			"minor" : 6,
			"revision" : 0
		},
		"boxes" : 		[
			{
				"box" : 				{
					"maxclass" : "comment",
					"text" : "POWER TRIO SONG ARRANGER",
					"fontsize" : 24.0,
					"patching_rect" : [ 20.0, 20.0, 500.0, 33.0 ],
					"id" : "obj-1"
				}
			},
			{
				"box" : 				{
					"maxclass" : "textfile",
					"filename" : "track_6_song_arranger/song_arranger.js",
					"patching_rect" : [ 20.0, 70.0, 100.0, 20.0 ],
					"id" : "obj-2"
				}
			},
			{
				"box" : 				{
					"maxclass" : "newobj",
					"text" : "node.script song_arranger.js @autostart 1",
					"patching_rect" : [ 20.0, 100.0, 300.0, 22.0 ],
					"id" : "obj-3",
					"numinlets" : 1,
					"numoutlets" : 4,
					"outlettype" : [ "", "", "", "" ]
				}
			},
			{
				"box" : 				{
					"maxclass" : "newobj",
					"text" : "dict ---power_trio_brain @embed 0",
					"patching_rect" : [ 400.0, 100.0, 220.0, 22.0 ],
					"id" : "obj-4"
				}
			},
			{
				"box" : 				{
					"maxclass" : "panel",
					"bgcolor" : [ 0.2, 0.2, 0.3, 1.0 ],
					"patching_rect" : [ 20.0, 150.0, 400.0, 250.0 ],
					"id" : "obj-5"
				}
			},
			{
				"box" : 				{
					"maxclass" : "comment",
					"text" : "PROGRESSION LIBRARY",
					"fontsize" : 14.0,
					"textcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"patching_rect" : [ 30.0, 160.0, 200.0, 22.0 ],
					"id" : "obj-6"
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.text",
					"text" : "Save Current Progression",
					"patching_rect" : [ 30.0, 190.0, 150.0, 30.0 ],
					"id" : "obj-7",
					"varname" : "save_prog_btn"
				}
			},
			{
				"box" : 				{
					"maxclass" : "textedit",
					"text" : "progression_name",
					"patching_rect" : [ 190.0, 190.0, 200.0, 30.0 ],
					"id" : "obj-8",
					"varname" : "prog_name_input"
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.text",
					"text" : "List Progressions",
					"patching_rect" : [ 30.0, 230.0, 150.0, 30.0 ],
					"id" : "obj-9",
					"varname" : "list_prog_btn"
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.menu",
					"patching_rect" : [ 190.0, 230.0, 200.0, 30.0 ],
					"id" : "obj-10",
					"varname" : "prog_menu",
					"parameter_enable" : 1
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.text",
					"text" : "Load Selected",
					"patching_rect" : [ 30.0, 270.0, 150.0, 30.0 ],
					"id" : "obj-11",
					"varname" : "load_prog_btn"
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.text",
					"text" : "Delete Selected",
					"patching_rect" : [ 190.0, 270.0, 150.0, 30.0 ],
					"id" : "obj-12",
					"varname" : "delete_prog_btn"
				}
			},
			{
				"box" : 				{
					"maxclass" : "message",
					"text" : "list_progressions",
					"patching_rect" : [ 30.0, 310.0, 120.0, 22.0 ],
					"id" : "obj-13"
				}
			},
			{
				"box" : 				{
					"maxclass" : "panel",
					"bgcolor" : [ 0.2, 0.3, 0.2, 1.0 ],
					"patching_rect" : [ 440.0, 150.0, 400.0, 250.0 ],
					"id" : "obj-14"
				}
			},
			{
				"box" : 				{
					"maxclass" : "comment",
					"text" : "SECTION DEFINITIONS",
					"fontsize" : 14.0,
					"textcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"patching_rect" : [ 450.0, 160.0, 200.0, 22.0 ],
					"id" : "obj-15"
				}
			},
			{
				"box" : 				{
					"maxclass" : "textedit",
					"text" : "section_id",
					"patching_rect" : [ 450.0, 190.0, 100.0, 30.0 ],
					"id" : "obj-16",
					"varname" : "section_id_input"
				}
			},
			{
				"box" : 				{
					"maxclass" : "textedit",
					"text" : "Section Name",
					"patching_rect" : [ 560.0, 190.0, 120.0, 30.0 ],
					"id" : "obj-17",
					"varname" : "section_name_input"
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.menu",
					"patching_rect" : [ 690.0, 190.0, 140.0, 30.0 ],
					"id" : "obj-18",
					"varname" : "section_prog_menu",
					"parameter_enable" : 1
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.numbox",
					"patching_rect" : [ 450.0, 230.0, 50.0, 30.0 ],
					"id" : "obj-19",
					"varname" : "section_bars_input",
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_shortname" : "bars",
							"parameter_type" : 1,
							"parameter_longname" : "section_bars"
						}
					}
				}
			},
			{
				"box" : 				{
					"maxclass" : "comment",
					"text" : "Bars",
					"patching_rect" : [ 510.0, 235.0, 40.0, 20.0 ],
					"id" : "obj-20"
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.text",
					"text" : "Create Section",
					"patching_rect" : [ 560.0, 230.0, 120.0, 30.0 ],
					"id" : "obj-21",
					"varname" : "create_section_btn"
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.text",
					"text" : "List Sections",
					"patching_rect" : [ 690.0, 230.0, 140.0, 30.0 ],
					"id" : "obj-22",
					"varname" : "list_sections_btn"
				}
			},
			{
				"box" : 				{
					"maxclass" : "textedit",
					"text" : "Section List",
					"patching_rect" : [ 450.0, 270.0, 380.0, 120.0 ],
					"id" : "obj-23",
					"varname" : "section_list_display",
					"readonly" : 1
				}
			},
			{
				"box" : 				{
					"maxclass" : "panel",
					"bgcolor" : [ 0.3, 0.2, 0.2, 1.0 ],
					"patching_rect" : [ 20.0, 420.0, 820.0, 200.0 ],
					"id" : "obj-24"
				}
			},
			{
				"box" : 				{
					"maxclass" : "comment",
					"text" : "SONG ARRANGEMENT",
					"fontsize" : 14.0,
					"textcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"patching_rect" : [ 30.0, 430.0, 200.0, 22.0 ],
					"id" : "obj-25"
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.menu",
					"patching_rect" : [ 30.0, 460.0, 150.0, 30.0 ],
					"id" : "obj-26",
					"varname" : "add_section_menu",
					"parameter_enable" : 1
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.text",
					"text" : "Add to Arrangement",
					"patching_rect" : [ 190.0, 460.0, 140.0, 30.0 ],
					"id" : "obj-27",
					"varname" : "add_to_arrangement_btn"
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.numbox",
					"patching_rect" : [ 340.0, 460.0, 50.0, 30.0 ],
					"id" : "obj-28",
					"varname" : "arrangement_position",
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_shortname" : "pos",
							"parameter_type" : 1,
							"parameter_longname" : "arrangement_position"
						}
					}
				}
			},
			{
				"box" : 				{
					"maxclass" : "comment",
					"text" : "Position",
					"patching_rect" : [ 400.0, 465.0, 60.0, 20.0 ],
					"id" : "obj-29"
				}
			},
			{
				"box" : 				{
					"maxclass" : "textedit",
					"text" : "Arrangement Timeline",
					"patching_rect" : [ 30.0, 500.0, 460.0, 100.0 ],
					"id" : "obj-30",
					"varname" : "arrangement_display",
					"readonly" : 1,
					"fontsize" : 12.0
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.text",
					"text" : "Clear Arrangement",
					"patching_rect" : [ 500.0, 500.0, 120.0, 30.0 ],
					"id" : "obj-31",
					"varname" : "clear_arrangement_btn"
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.text",
					"text" : "Get Arrangement",
					"patching_rect" : [ 500.0, 540.0, 120.0, 30.0 ],
					"id" : "obj-32",
					"varname" : "get_arrangement_btn"
				}
			},
			{
				"box" : 				{
					"maxclass" : "comment",
					"text" : "Total Bars:",
					"patching_rect" : [ 630.0, 500.0, 80.0, 20.0 ],
					"id" : "obj-33"
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.numbox",
					"patching_rect" : [ 710.0, 495.0, 60.0, 30.0 ],
					"id" : "obj-34",
					"varname" : "total_bars_display",
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_shortname" : "total",
							"parameter_type" : 1,
							"parameter_longname" : "total_bars"
						}
					}
				}
			},
			{
				"box" : 				{
					"maxclass" : "panel",
					"bgcolor" : [ 0.15, 0.15, 0.2, 1.0 ],
					"patching_rect" : [ 20.0, 640.0, 820.0, 80.0 ],
					"id" : "obj-35"
				}
			},
			{
				"box" : 				{
					"maxclass" : "comment",
					"text" : "PLAYBACK & EXPORT",
					"fontsize" : 14.0,
					"textcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"patching_rect" : [ 30.0, 650.0, 200.0, 22.0 ],
					"id" : "obj-36"
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.text",
					"text" : "▶ PLAY",
					"patching_rect" : [ 30.0, 680.0, 80.0, 30.0 ],
					"id" : "obj-37",
					"varname" : "play_btn",
					"activebgcolor" : [ 0.0, 0.8, 0.0, 1.0 ]
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.text",
					"text" : "⏹ STOP",
					"patching_rect" : [ 120.0, 680.0, 80.0, 30.0 ],
					"id" : "obj-38",
					"varname" : "stop_btn",
					"activebgcolor" : [ 0.8, 0.0, 0.0, 1.0 ]
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.text",
					"text" : "Jump to Section",
					"patching_rect" : [ 210.0, 680.0, 120.0, 30.0 ],
					"id" : "obj-39",
					"varname" : "jump_btn"
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.numbox",
					"patching_rect" : [ 340.0, 680.0, 50.0, 30.0 ],
					"id" : "obj-40",
					"varname" : "jump_section_num",
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_shortname" : "section",
							"parameter_type" : 1,
							"parameter_longname" : "jump_section"
						}
					}
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.text",
					"text" : "📊 Status",
					"patching_rect" : [ 410.0, 680.0, 100.0, 30.0 ],
					"id" : "obj-41",
					"varname" : "status_btn"
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.text",
					"text" : "💾 Save Song",
					"patching_rect" : [ 520.0, 680.0, 120.0, 30.0 ],
					"id" : "obj-42",
					"varname" : "save_song_btn",
					"activebgcolor" : [ 0.0, 0.5, 0.8, 1.0 ]
				}
			},
			{
				"box" : 				{
					"maxclass" : "live.text",
					"text" : "🚀 Export to Ableton",
					"patching_rect" : [ 650.0, 680.0, 180.0, 30.0 ],
					"id" : "obj-43",
					"varname" : "export_btn",
					"activebgcolor" : [ 0.8, 0.4, 0.0, 1.0 ]
				}
			},
			{
				"box" : 				{
					"maxclass" : "newobj",
					"text" : "route progression_list section_created arrangement_display total_bars",
					"patching_rect" : [ 20.0, 750.0, 500.0, 22.0 ],
					"id" : "obj-44",
					"numinlets" : 1,
					"numoutlets" : 5,
					"outlettype" : [ "", "", "", "", "" ]
				}
			},
			{
				"box" : 				{
					"maxclass" : "message",
					"text" : "clear_arrangement",
					"patching_rect" : [ 500.0, 540.0, 120.0, 22.0 ],
					"id" : "obj-45"
				}
			},
			{
				"box" : 				{
					"maxclass" : "message",
					"text" : "get_arrangement",
					"patching_rect" : [ 500.0, 580.0, 120.0, 22.0 ],
					"id" : "obj-46"
				}
			},
			{
				"box" : 				{
					"maxclass" : "message",
					"text" : "play",
					"patching_rect" : [ 30.0, 720.0, 35.0, 22.0 ],
					"id" : "obj-47"
				}
			},
			{
				"box" : 				{
					"maxclass" : "message",
					"text" : "stop",
					"patching_rect" : [ 120.0, 720.0, 35.0, 22.0 ],
					"id" : "obj-48"
				}
			},
			{
				"box" : 				{
					"maxclass" : "message",
					"text" : "status",
					"patching_rect" : [ 410.0, 720.0, 45.0, 22.0 ],
					"id" : "obj-49"
				}
			}
		],
		"lines" : 		[
			{
				"patchline" : 				{
					"source" : [ "obj-2", 0 ],
					"destination" : [ "obj-3", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-3", 0 ],
					"destination" : [ "obj-44", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-3", 1 ],
					"destination" : [ "obj-4", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-13", 0 ],
					"destination" : [ "obj-3", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-45", 0 ],
					"destination" : [ "obj-3", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-46", 0 ],
					"destination" : [ "obj-3", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-47", 0 ],
					"destination" : [ "obj-3", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-48", 0 ],
					"destination" : [ "obj-3", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-49", 0 ],
					"destination" : [ "obj-3", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-44", 0 ],
					"destination" : [ "obj-10", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-44", 2 ],
					"destination" : [ "obj-30", 0 ]
				}
			},
			{
				"patchline" : 				{
					"source" : [ "obj-44", 3 ],
					"destination" : [ "obj-34", 0 ]
				}
			}
		]
	}
}
