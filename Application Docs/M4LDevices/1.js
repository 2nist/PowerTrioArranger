{
	"boxes" : [ 		{
			"box" : 			{
				"maxclass" : "newobj",
				"text" : "route note_out",
				"patching_rect" : [ 330.0, 175.0, 86.0, 22.0 ],
				"numinlets" : 2,
				"id" : "obj-13",
				"numoutlets" : 2,
				"outlettype" : [ "", "" ]
			}

		}
, 		{
			"box" : 			{
				"maxclass" : "comment",
				"text" : "RESPONSE LOOP\n(Prevents Hanging)\nMust go back to Inlet 1",
				"linecount" : 3,
				"patching_rect" : [ 131.0, 175.0, 150.0, 47.0 ],
				"numinlets" : 1,
				"id" : "obj-12",
				"numoutlets" : 0
			}

		}
, 		{
			"box" : 			{
				"maxclass" : "newobj",
				"text" : "prepend dict_response",
				"patching_rect" : [ 114.0, 151.0, 131.0, 22.0 ],
				"numinlets" : 1,
				"id" : "obj-10",
				"numoutlets" : 1,
				"outlettype" : [ "" ]
			}

		}
, 		{
			"box" : 			{
				"maxclass" : "newobj",
				"text" : "dict ---power_trio_brain",
				"patching_rect" : [ 114.0, 120.0, 133.0, 22.0 ],
				"numinlets" : 2,
				"id" : "obj-9",
				"numoutlets" : 5,
				"outlettype" : [ "dictionary", "", "", "", "" ],
				"saved_object_attributes" : 				{
					"embed" : 0,
					"legacy" : 1,
					"parameter_enable" : 0,
					"parameter_mappable" : 0
				}

			}

		}
, 		{
			"box" : 			{
				"maxclass" : "newobj",
				"text" : "route dict",
				"patching_rect" : [ 114.0, 85.0, 59.0, 22.0 ],
				"numinlets" : 2,
				"id" : "obj-8",
				"numoutlets" : 2,
				"outlettype" : [ "", "" ]
			}

		}
, 		{
			"box" : 			{
				"maxclass" : "newobj",
				"text" : "node.script logic.js @autostart 1 @watch 1",
				"patching_rect" : [ 114.0, 51.0, 236.0, 22.0 ],
				"numinlets" : 1,
				"id" : "obj-7",
				"color" : [ 0.843137254901961, 0.647058823529412, 0.647058823529412, 1.0 ],
				"numoutlets" : 2,
				"outlettype" : [ "", "" ],
				"textfile" : 				{
					"filename" : "logic.js",
					"flags" : 0,
					"embed" : 0,
					"autowatch" : 1
				}
,
				"saved_object_attributes" : 				{
					"autostart" : 1,
					"defer" : 0,
					"watch" : 1
				}

			}

		}
, 		{
			"box" : 			{
				"maxclass" : "newobj",
				"text" : "prepend transport_step",
				"patching_rect" : [ 114.0, 13.0, 133.0, 22.0 ],
				"numinlets" : 1,
				"id" : "obj-6",
				"numoutlets" : 1,
				"outlettype" : [ "" ]
			}

		}
, 		{
			"box" : 			{
				"maxclass" : "newobj",
				"text" : "change",
				"patching_rect" : [ 114.0, -18.0, 48.0, 22.0 ],
				"numinlets" : 1,
				"id" : "obj-5",
				"numoutlets" : 3,
				"outlettype" : [ "", "int", "int" ]
			}

		}
, 		{
			"box" : 			{
				"maxclass" : "newobj",
				"text" : "plugsync~",
				"patching_rect" : [ 114.0, -52.0, 119.0, 22.0 ],
				"fontface" : 0,
				"numinlets" : 1,
				"id" : "obj-20",
				"numoutlets" : 9,
				"fontsize" : 12.0,
				"outlettype" : [ "int", "int", "int", "float", "list", "float", "float", "int", "int" ],
				"fontname" : "Arial"
			}

		}
 ],
	"lines" : [ 		{
			"patchline" : 			{
				"source" : [ "obj-10", 0 ],
				"destination" : [ "obj-7", 0 ],
				"midpoints" : [ 123.5, 184.0, 101.0, 184.0, 101.0, 40.0, 123.5, 40.0 ]
			}

		}
, 		{
			"patchline" : 			{
				"source" : [ "obj-20", 2 ],
				"destination" : [ "obj-5", 0 ]
			}

		}
, 		{
			"patchline" : 			{
				"source" : [ "obj-5", 0 ],
				"destination" : [ "obj-6", 0 ]
			}

		}
, 		{
			"patchline" : 			{
				"source" : [ "obj-6", 0 ],
				"destination" : [ "obj-7", 0 ]
			}

		}
, 		{
			"patchline" : 			{
				"source" : [ "obj-7", 1 ],
				"destination" : [ "obj-13", 0 ]
			}

		}
, 		{
			"patchline" : 			{
				"source" : [ "obj-7", 0 ],
				"destination" : [ "obj-8", 0 ]
			}

		}
, 		{
			"patchline" : 			{
				"source" : [ "obj-8", 0 ],
				"destination" : [ "obj-9", 0 ]
			}

		}
, 		{
			"patchline" : 			{
				"source" : [ "obj-9", 0 ],
				"destination" : [ "obj-10", 0 ]
			}

		}
 ],
	"appversion" : 	{
		"major" : 9,
		"minor" : 0,
		"revision" : 10,
		"architecture" : "x64",
		"modernui" : 1
	}
,
	"classnamespace" : "box"
}
