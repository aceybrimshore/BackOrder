// Default Back Order CSV provided in user prompt
export const INITIAL_BACKORDER_CSV = `Item,Back Order Qty,Supply Required By Date,Document Number,Status,Expected Ship Date,Estimate Stock Available Date,Customer PO#,Date Created,Quantity,Qty Shipped,Back Order Order Value (EXT Ex GST),Commit,Location,Customer Name,Class,Brand,Type,Inventory Type
MTX02BKP,180,19/10/2026,SO0469427,Pending Fulfillment,19/10/2026,,6112500112 6/13,25/4/2025 4:43 PM,180,0,33300,,Sydney,Taubenreuther Gmbh,MAXTRAX,MAXTRAX,Assembly/Bill of Materials,Finished Goods Assembly
MTX02BKP,180,22/3/2027,SO0469429,Pending Fulfillment,22/3/2027,,6112500112 7/13,25/4/2025 4:46 PM,180,0,33300,,Sydney,Taubenreuther Gmbh,MAXTRAX,MAXTRAX,Assembly/Bill of Materials,Finished Goods Assembly
5504343,1,7/7/2025,SO0491863,Pending Fulfillment,8/7/2025,,S 236 020808,7/7/2025 8:53 AM,1,0,0,,Sydney,REPCO AUTO PARTS MERCHANTS (GPC) : 236 - RAP GEELONG NORTH,Marketing,,Non-inventory Item,Non Inventory Item
510-POS-00012,1,23/2/2026,SO0549276,Partially Fulfilled,23/2/2026,,RRAUMKTG-RT-239 / Repco PO: # 094-022610,23/2/2026 2:54 PM,1,0,0,,Sydney,Promotional Account - AUS,Marketing,Rhino-Rack,Inventory Item,Component
BCW,1,27/3/2026,SO0557403,Partially Fulfilled,27/3/2026,,63418,26/3/2026 12:02 PM,100,99,31.09,,Sydney,CADDY STORAGE BLACKTOWN,Other Products : ACCESSORIES,Rhino-Rack,Assembly/Bill of Materials,Finished Goods Assembly
MTX02BKP,51,18/9/2026,SO0563241,Pending Fulfillment,18/9/2026,,6112600022,21/4/2026 10:01 AM,180,0,9435,,Sydney,Taubenreuther Gmbh,MAXTRAX,MAXTRAX,Assembly/Bill of Materials,Finished Goods Assembly
MTX02BKP,180,23/10/2026,SO0563242,Pending Fulfillment,23/10/2026,,6112600023,21/4/2026 10:03 AM,180,0,33300,,Sydney,Taubenreuther Gmbh,MAXTRAX,MAXTRAX,Assembly/Bill of Materials,Finished Goods Assembly
15021,5,24/7/2026,SO0563718,Pending Fulfillment,24/7/2026,,PO0030508,22/4/2026 5:56 PM,5,0,243.62,,Sydney,ICC Rhino Rack AU selling to NZ,ROCKYMOUNTS,RockyMounts,Inventory Item,Finished Goods Buy
61031,6,27/7/2026,SO0565595,Partially Fulfilled,27/7/2026,,612600643,30/4/2026 3:06 PM,6,0,347.46,,Sydney,Taubenreuther Gmbh,Other Products : ACCESSORIES,Rhino-Rack,Inventory Item,Finished Goods Buy
61031,2,11/5/2026,SO0567062,Partially Fulfilled,11/5/2026,,PO-00012551,6/5/2026 12:11 PM,2,0,152.72,,Sydney,ALTAPAC,Other Products : ACCESSORIES,Rhino-Rack,Inventory Item,Finished Goods Buy
MTXFRMMPSU,10,5/5/2026,SO0566682,Pending Fulfillment,5/5/2026,,291622,5/5/2026 11:25 AM,10,0,718.2,,Sydney - MAXTRAX,Aeroklas Asia Pacific Group Pty Ltd,MAXTRAX,MAXTRAX,Inventory Item,Finished Goods Buy
MTXMPS17,4,8/5/2026,SO0567697,Partially Fulfilled,9/5/2026,,PO-11789,8/5/2026 5:01 PM,4,0,132,,Sydney - MAXTRAX,Port Lincoln 4WD,MAXTRAX,MAXTRAX,Inventory Item,Finished Goods Buy
TGTLVL,1,13/5/2026,SO0568841,Partially Fulfilled,13/5/2026,,TEOC Weipa Fishing comp promo,13/5/2026 10:51 AM,1,0,0,,Sydney - TRED,Tred AU Promotions - Sales,TRED,Tred,Assembly/Bill of Materials,Finished Goods Assembly
MTXMPB,2,15/5/2026,SO0569313,Partially Fulfilled,15/5/2026,,8011,14/5/2026 4:03 PM,2,0,271.34,,Sydney - MAXTRAX,OZ Offroad PTY LTD,MAXTRAX,MAXTRAX,Assembly/Bill of Materials,Finished Goods Assembly
MTXSRV,18,19/5/2026,SO0570333,Partially Fulfilled,19/5/2026,,3000601338,19/5/2026 8:36 AM,18,0,1292.76,,Sydney - MAXTRAX,Department of Defence,MAXTRAX,MAXTRAX,Inventory Item,Finished Goods Buy
MTXIATRS,332,5/8/2026,SO0571103,Partially Fulfilled,5/8/2026,,PO0030638,21/5/2026 9:18 AM,444,9,46901.87,,Sydney,ICC Rhino Rack AU selling to US,MAXTRAX,MAXTRAX,Inventory Item,Finished Goods Buy
CADDY05,4,27/5/2026,SO0571428,Partially Fulfilled,27/5/2026,,63729,22/5/2026 9:12 AM,20,16,315.04,,Sydney,CADDY STORAGE BLACKTOWN,Racks : LEGS,Rhino-Rack,Assembly/Bill of Materials,Finished Goods Assembly
PZQ3012100,42,4/9/2026,SO0573538,Pending Fulfillment,4/9/2026,,10025950,1/6/2026 10:39 AM,42,0,6603.66,,Sydney,TOYOTA MOTOR CORPORATION AUST. LTD.,Racks : COMPLETE RACKS,Rhino-Rack,Assembly/Bill of Materials,Finished Goods Assembly
PZQ3012210,168,4/9/2026,SO0573538,Pending Fulfillment,4/9/2026,,10025950,1/6/2026 10:39 AM,168,0,24002.16,,Sydney,TOYOTA MOTOR CORPORATION AUST. LTD.,Racks : COMPLETE RACKS,Rhino-Rack,Assembly/Bill of Materials,Finished Goods Assembly
PZQ3089050,252,4/9/2026,SO0573538,Pending Fulfillment,4/9/2026,,10025950,1/6/2026 10:39 AM,252,0,48237.84,,Sydney,TOYOTA MOTOR CORPORATION AUST. LTD.,Racks : COMPLETE RACKS,Rhino-Rack,Assembly/Bill of Materials,Finished Goods Assembly
PZQ3012210,168,7/8/2026,SO0573549,Partially Fulfilled,7/8/2026,,10025908,1/6/2026 10:54 AM,210,42,24002.16,,Sydney,TOYOTA MOTOR CORPORATION AUST. LTD.,Racks : COMPLETE RACKS,Rhino-Rack,Assembly/Bill of Materials,Finished Goods Assembly
RDB150,34,27/7/2026,SO0573553,Partially Fulfilled,27/7/2026,,612600776,1/6/2026 11:00 AM,50,16,2854.98,,Sydney,Taubenreuther Gmbh,,Rhino-Rack,Assembly/Bill of Materials,Finished Goods Assembly
RCP65-BK,2,1/7/2026,SO0574646,Partially Fulfilled,1/7/2026,,63809,4/6/2026 1:26 PM,21,12,382.42,,Sydney,CADDY STORAGE BLACKTOWN,Racks : BASE KITS,Rhino-Rack,Assembly/Bill of Materials,Finished Goods Assembly
RNITHB1,10,27/7/2026,SO0577577,Partially Fulfilled,27/7/2026,,612600850,16/6/2026 2:55 PM,10,0,2684.50,,Sydney,Taubenreuther Gmbh,Racks : MOUNTING SYSTEMS,Rhino-Rack,Inventory Item,Finished Goods Buy
TREDPROBB,40,25/6/2026,SO0579790,Partially Fulfilled,25/6/2026,,1832493,24/6/2026 10:21 AM,60,20,6088.00,,Sydney - TRED,ARB Main,TRED,Tred,Inventory Item,Finished Goods Buy
MS30M,20,14/7/2026,SO0584116,Partially Fulfilled,14/7/2026,,0001-P84412,10/7/2026 7:58 AM,20,0,8037.40,,Sydney,RXI GROUP,Other Products : LADDER RACKS,Rhino-Rack,Assembly/Bill of Materials,Finished Goods Assembly
SZ126B-U,80,5/8/2026,SO0584549,Partially Fulfilled,5/8/2026,,PO0030992,13/7/2026 12:07 PM,360,0,4540.87,,Sydney,ICC Rhino Rack AU selling to US,Racks : BARS,Rhino-Rack,Assembly/Bill of Materials,Finished Goods Assembly
MTX02SO,42,30/7/2026,SO0586859,Partially Fulfilled,30/7/2026,,4502267408,22/7/2026 8:16 AM,42,0,8506.68,,Sydney - MAXTRAX,Anaconda Pty Ltd,MAXTRAX,MAXTRAX,Assembly/Bill of Materials,Finished Goods Assembly
SCALVLPR,1500,4/9/2026,SO0586943,Pending Fulfillment,4/9/2026,,4521926681,22/7/2026 11:26 AM,1500,0,29565.00,,Sydney - TRED,SRGS : Supercheap Auto,TRED,Tred,Assembly/Bill of Materials,Finished Goods Assembly
SZ137B-U,186,5/8/2026,SO0588399,Pending Fulfillment,5/8/2026,,PO0031115,28/7/2026 2:47 PM,200,0,11960.75,,Sydney,ICC Rhino Rack AU selling to US,Racks : BARS,Rhino-Rack,Assembly/Bill of Materials,Finished Goods Assembly
SZ150B-U,173,5/8/2026,SO0588399,Pending Fulfillment,5/8/2026,,PO0031115,28/7/2026 2:47 PM,540,0,11652.06,,Sydney,ICC Rhino Rack AU selling to US,Racks : BARS,Rhino-Rack,Assembly/Bill of Materials,Finished Goods Assembly
PZQ3012210,504,28/8/2026,SO0587535,Pending Fulfillment,28/8/2026,,10038129,24/7/2026 10:19 AM,504,0,72006.48,,Sydney,TOYOTA MOTOR CORPORATION AUST. LTD.,Racks : COMPLETE RACKS,Rhino-Rack,Assembly/Bill of Materials,Finished Goods Assembly
PZQ3060071,168,28/8/2026,SO0587535,Pending Fulfillment,28/8/2026,,10038129,24/7/2026 10:19 AM,168,0,10720.08,,Sydney,TOYOTA MOTOR CORPORATION AUST. LTD.,Racks : COMPLETE RACKS,Rhino-Rack,Assembly/Bill of Materials,Finished Goods Assembly
MTX02SODS,280,21/9/2026,SO0588614,Pending Fulfillment,21/9/2026,,4502268208,29/7/2026 12:03 PM,280,0,56711.20,,Sydney - MAXTRAX,Anaconda Pty Ltd,MAXTRAX,MAXTRAX,Assembly/Bill of Materials,Finished Goods Assembly
MTX02BKDS,90,21/9/2026,SO0588615,Pending Fulfillment,21/9/2026,,4502268209,29/7/2026 12:08 PM,90,0,18228.60,,Sydney - MAXTRAX,Anaconda Pty Ltd,MAXTRAX,MAXTRAX,Assembly/Bill of Materials,Finished Goods Assembly
MTX02SODS,90,16/11/2026,SO0588616,Pending Fulfillment,16/11/2026,,4502268218,29/7/2026 12:09 PM,90,0,18228.60,,Sydney - MAXTRAX,Anaconda Pty Ltd,MAXTRAX,MAXTRAX,Assembly/Bill of Materials,Finished Goods Assembly
MTX02BKDS,120,16/11/2026,SO0588616,Pending Fulfillment,16/11/2026,,4502268218,29/7/2026 12:09 PM,120,0,24304.80,,Sydney - MAXTRAX,Anaconda Pty Ltd,MAXTRAX,MAXTRAX,Assembly/Bill of Materials,Finished Goods Assembly
LVLPR,501,5/8/2026,SO0588754,Pending Fulfillment,5/8/2026,,4521956970,29/7/2026 4:27 PM,501,0,9874.71,,Sydney - TRED,SRGS : BCF,TRED,Tred,Assembly/Bill of Materials,Finished Goods Assembly
RNITHB1,47,12/8/2026,SO0588761,Partially Fulfilled,12/8/2026,,PO0031127,29/7/2026 5:30 PM,47,0,10898.59,,Sydney,ICC Rhino Rack AU selling to NZ,Racks : MOUNTING SYSTEMS,Rhino-Rack,Inventory Item,Finished Goods Buy
MS30M,30,30/7/2026,SO0589078,Pending Fulfillment,30/7/2026,,0001-P85591,31/7/2026 8:15 AM,30,0,12056.10,,Sydney,RXI GROUP,Other Products : LADDER RACKS,Rhino-Rack,Assembly/Bill of Materials,Finished Goods Assembly
MTX02SOP,72,25/8/2026,SO0589885,Pending Fulfillment,25/8/2026,,B260442,4/8/2026 10:50 AM,72,0,13320.00,,Sydney - MAXTRAX,GENESIS IMPORT GmBH,MAXTRAX,MAXTRAX,Assembly/Bill of Materials,Finished Goods Assembly
MTXXSOP,50,25/8/2026,SO0589885,Pending Fulfillment,25/8/2026,,B260442,4/8/2026 10:50 AM,50,0,16450.00,,Sydney - MAXTRAX,GENESIS IMPORT GmBH,,MAXTRAX,Assembly/Bill of Materials,Finished Goods Assembly
MTX02BKP,120,5/8/2026,SO0589671,Pending Fulfillment,5/8/2026,,PO0031132,3/8/2026 12:44 PM,120,0,10567.81,,Sydney,ICC Rhino Rack AU selling to US,MAXTRAX,MAXTRAX,Assembly/Bill of Materials,Finished Goods Assembly
MTXUMPS17,600,5/8/2026,SO0589671,Pending Fulfillment,5/8/2026,,PO0031132,3/8/2026 12:44 PM,600,0,13805.65,,Sydney,ICC Rhino Rack AU selling to US,MAXTRAX,MAXTRAX,Inventory Item,Finished Goods Buy
MTXXFJRP,49,5/8/2026,SO0589671,Pending Fulfillment,5/8/2026,,PO0031132,3/8/2026 12:44 PM,49,0,12364.40,,Sydney,ICC Rhino Rack AU selling to US,MAXTRAX,MAXTRAX,Assembly/Bill of Materials,Finished Goods Assembly
DK108,30,3/8/2026,SO0589957,Partially Fulfilled,3/8/2026,,90895,4/8/2026 1:54 PM,35,5,2160.90,,Sydney,ROOF RACKS GALORE (RRGQ) : ROOF RACKS GALORE BRENDALE (RRGQ),Racks : BASE KITS,Rhino-Rack,Assembly/Bill of Materials,Finished Goods Assembly
MS30M,20,10/8/2026,SO0590561,Pending Fulfillment,10/8/2026,,15368,6/8/2026 12:17 PM,20,0,7795.00,,Sydney,CADDY STORAGE BRENDALE,Other Products : LADDER RACKS,Rhino-Rack,Assembly/Bill of Materials,Finished Goods Assembly`;

// Initial official Work Orders schedule dataset provided by production planning
export const INITIAL_WORKORDER_CSV = `Work Center,Stock Avalable?,Start Date,End Date,Mins., Hrs.,WO #,Part #,Table #,Description,Status,Qty,Printed,Memo,Resource Hrs,Process Flag,DoNotRunSchScript,Traveler Memo,Planning Priority Code
2 H Table,Components Available,30/7/2026,31/7/2026,1.5,0,WO0089739,SP320,,RLKVA/RLKHD COVERS,In Process,5,Yes,W26 - CSO,.05,No,Yes,,
5 H Table,Components Available,31/7/2026,28/8/2026,263,4.4,WO0090366,RL150S11,,TOYOTA LC70 SERIES LEG SET 150MM (PR) S1,In Process,192,Yes,W31 - CSO,21.92,No,Yes,,
2 H Table,Components Available,31/7/2026,31/7/2026,6,.1,WO0090012,RARBA,,BOAT ROLLER BUSH ASSEMBLY,In Process,30,Yes,W28 - CSO,.20,No,Yes,,
2 H Table,Components Available,31/7/2026,31/7/2026,72,1.2,WO0090066,RUBK,,RHINO U BOLT KIT(4*U BOLTS),In Process,72,Yes,W28 - CSO,2.40,No,Yes,,
LR 2H Table,28/08/2026,6/8/2026,6/8/2026,328,5.5,WO0090455,MS30M,,MULTISLIDE 3.0M LADDER RAIL SET,In Process,40,Yes,W32 - CSO,10.933,No,No,,
4 H Table,Components Available,7/8/2026,7/8/2026,130,2.2,WO0090496,RCP58-BK,4,BASE KIT GENERIC TRACK SWIVEL (4PCS),In Process,200,Yes,W32 - CSO,8.667,No,Yes,,
RAT 6H TABLE,Components Available,7/8/2026,7/8/2026,252,4.2,WO0089524,PZQ3089050,10,AERO ROOF RACKS,In Process,84,Yes,W25 - CSO,25.20,No,Yes,,
2 H Table,Components Available,14/8/2026,14/8/2026,7.5,.1,WO0089899,RTD3,,TIEDOWNS 3M  (PR) CAMLOCK BUCKLE,In Process,30,Yes,W27 - CSO TU,.25,No,Yes,,
2 H Table,Components Available,14/8/2026,14/8/2026,15,.3,WO0090551,710-RQM-00001,,TELSTRA SPACER KIT,In Process,10,Yes,W33 - SUB,.50,No,Yes,,
2 H Table,Stock Available,14/8/2026,14/8/2026,59.8,1,WO0090427,LR470,,LADDER ROLLER 470MM,Released,100,Yes,W32 - SUB,1.993,No,Yes,,
2 H Table,Components Available,14/8/2026,14/8/2026,162,2.7,WO0090364,RDB120P,,1200MM RECONN-DECK BAR - SINGLE,Released,216,Yes,W31 - CSO,5.40,No,Yes,,
4 H Table,Components Available,14/8/2026,14/8/2026,22.6,.4,WO0089945,53100,,SHOVEL HOLDER BRACKET FOR 5 SERIES PIONEER,Released,20,Yes,W28 - CSO,1.507,No,Yes,,
4 H Table,Components Available,14/8/2026,14/8/2026,146.7,2.4,WO0090015,RCP17-BK,,BASE KIT 200 SERIES LC 11/07- (6PCS),Released,90,Yes,W28 - CSO,9.78,No,Yes,,
4 H Table,Components Available,14/8/2026,14/8/2026,132,2.2,WO0090344,RLTAB-12,,LOCKING TAB ASSEMBLY 12 PACK,Released,220,Yes,W31 - SUB,8.80,No,Yes,,
4 H Table,Components Available,14/8/2026,14/8/2026,132,2.2,WO0090433,RLTAB-12,,LOCKING TAB ASSEMBLY 12 PACK,Released,220,Yes,W32 - SUB,8.80,No,Yes,,
4 H Table,Components Available,14/8/2026,14/8/2026,230.4,3.8,WO0090434,RX100,,RX100 RAISED RAIL LEG KIT (4PCS),Released,192,Yes,W32 - SUB,15.36,No,Yes,,
5 H Table,Components Available,14/8/2026,14/8/2026,38.4,.6,WO0089732,RLTFHIF/M,,HYUNDAI I LOAD LEG KIT FRONT/MID (2PCS),Released,24,Yes,W26 - CSO,3.20,No,Yes,,
LR 1H Table,Components Available,14/8/2026,14/8/2026,400,6.7,WO0090428,P46-100,,4.6M X 100MM W\\- BLACK LOCKING END CAPS,Released,20,Yes,W32 - SUB,6.667,No,Yes,,
Machinery Table,Components Available,14/8/2026,14/8/2026,108,1.8,WO0090364,RDB120P,,1200MM RECONN-DECK BAR - SINGLE,Released,216,Yes,W31 - CSO,1.80,No,Yes,,
Machinery Table,Components Available,14/8/2026,14/8/2026,30,.5,WO0090399,RVP24,,VW AMAROK 2/11- 2 BAR,Released,20,Yes,W31 - CSO TU,.50,No,Yes,,
Machinery Table,Stock Available,14/8/2026,14/8/2026,59,1,WO0090427,LR470,,LADDER ROLLER 470MM,Released,100,Yes,W32 - SUB,.983,No,Yes,,
Machinery Table,Components Available,14/8/2026,14/8/2026,67.5,1.1,WO0090554,SUB0821,,TETHER DOUBLE LOOP 100MM LENGTH,Released,30,Yes,W33 - SUB,1.125,No,Yes,,
Machinery Table,Components Available,14/8/2026,14/8/2026,67.5,1.1,WO0090553,SUB0820,,TETHER DOUBLE LOOP 100MM LENGTH WITH PINS,Released,30,Yes,W33 - SUB,1.125,No,Yes,,
RAT 3H TABLE,Components Available,14/8/2026,14/8/2026,441,7.4,WO0089565,PZQ3060240,,"3 BAR SYSTEM – ROOF RACKS, NON ROOF RAIL TYPE",Released,42,Yes,W25 - CSO,22.05,No,Yes,,
RAT 3H TABLE,Components Available,14/8/2026,14/8/2026,220.3,3.7,WO0089823,RB1500B,,ALLOY BAR 1500MM BLK (1EA),Released,306,Yes,W27 - CSO,11.016,No,Yes,,
RAT 3H TABLE,Components Available,14/8/2026,14/8/2026,28.6,.5,WO0090399,RVP24,,VW AMAROK 2/11- 2 BAR,Released,20,Yes,W31 - CSO TU,1.43,No,Yes,,
RAT 4H TABLE,Components Available,14/8/2026,14/8/2026,180.6,3,WO0089567,PZQ3060260,,"2 BAR SYSTEM  – ROOF RACKS, ROOF RAIL TYPE",Released,84,Yes,W25 - CSO,12.04,No,Yes,,
RAT 4H TABLE,Components Available,14/8/2026,14/8/2026,37.5,.6,WO0090549,RSB04B,,RHINO STEALTH BAR 905MM BLACK,Released,40,Yes,W33 - SUB,2.50,No,Yes,,
RAT 6H TABLE,Stock Available,14/8/2026,14/8/2026,196,3.3,WO0090430,PZQ3075040,,ROOF RACK 3 BAR SYSTEM STD KIT (L1H1),Released,40,Yes,W32 - SUB,19.60,No,Yes,,
4 H Table,Components Available,28/8/2026,28/8/2026,70,1.2,WO0090501,RCP77-3-BK,,BASE KIT STARIA US4 (6 PCS),In Process,20,Yes,W32 - CSO,4.667,No,Yes,,
4 H Table,Components Available,28/8/2026,28/8/2026,18,.3,WO0090500,RCP76-BK,,BASE KIT GEN 6 HIACE SLWB (6PCS),In Process,20,Yes,W32 - CSO,1.20,No,Yes,,
5 H Table,Stock Available,28/8/2026,28/8/2026,226,3.8,WO0089552,PZQ3012210,,COROLLA CROSS 2 BAR SET,In Process,84,Yes,W25 - CSO,18.83,No,Yes,,
5 H Table,Components Available,28/8/2026,28/8/2026,226,3.8,WO0089554,PZQ3012210,,COROLLA CROSS 2 BAR SET,In Process,84,Yes,W25 - CSO,18.83,No,Yes,,
5 H Table,Components Available,28/8/2026,28/8/2026,14.4,.2,WO0089622,RLTFHIR,4,HYUNDAI I LOAD LEG KIT REAR (2PCS),Released,12,Yes,W25 - CSO,1.20,No,Yes,,
5 H Table,Stock Available,28/8/2026,28/8/2026,117.6,2,WO0089891,PZQ3060360,,ROOF RACK (WITH ROOF RAILS) 2-BAR,Released,42,Yes,W17 - CSO,9.80,No,Yes,,
5 H Table,Components Available,28/8/2026,28/8/2026,66,1.1,WO0090018,RCP65-BK,,BASE KIT HIACE GEN6 LWB (6PCS),In Process,66,Yes,W28 - CSO,5.50,No,Yes,,
5 H Table,Components Available,28/8/2026,28/8/2026,216,3.6,WO0090520,SZ150B-U,,SPORTZ BAR 1500MM BLACK - U,In Process,180,Yes,W32 - CSO,18.00,No,Yes,,
5 H Table,Components Available,28/8/2026,28/8/2026,172.8,2.9,WO0090506,RLTPFC,,FORD TRANSIT CARGO RLTP (2PCS),In Process,72,Yes,W32 - CSO,14.40,No,Yes,,
RAT 3H TABLE,Components Available,28/8/2026,28/8/2026,35.9,.6,WO0090510,RTC10,,CANOPY/UTE TRACK SET 1.0 MTR BLACK,In Process,27,Yes,W32 - CSO,1.796,No,Yes,,
RAT 6H TABLE,Components Available,28/8/2026,28/8/2026,252,4.2,WO0089520,PZQ3089050,,AERO ROOF RACKS,Released,84,Yes,W25 - CSO,25.20,No,Yes,,`;
