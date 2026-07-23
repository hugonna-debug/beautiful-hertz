export interface ColorRamp {
  id: string;
  name: string;
  hex: string;
  colors: string[];
}

export const FABRIC_PALETTES: ColorRamp[] = [
  { id: 'black', name: 'Black', hex: '#22282a', colors: ["#000000ff", "#101414ff", "#1c2222ff", "#22282aff", "#2a3034ff", "#4a5057ff"] },
  { id: 'blue', name: 'Blue', hex: '#3c49ad', colors: ["#180716ff", "#281e41ff", "#322d6aff", "#3c49adff", "#466ac9ff", "#61a0efff"] },
  { id: 'bluegray', name: 'Bluegray', hex: '#315b49', colors: ["#11150bff", "#0b2b28ff", "#2e403aff", "#315b49ff", "#557e85ff", "#79979dff"] },
  { id: 'brown', name: 'Brown', hex: '#62351c', colors: ["#1d131eff", "#411e05ff", "#4b2b13ff", "#62351cff", "#744b30ff", "#996b4aff"] },
  { id: 'charcoal', name: 'Charcoal', hex: '#2a3034', colors: ["#000000ff", "#130d14ff", "#1c2222ff", "#2a3034ff", "#4a5057ff", "#6e7675ff"] },
  { id: 'forest', name: 'Forest', hex: '#07391d', colors: ["#09131dff", "#0b1f25ff", "#0b2b28ff", "#07391dff", "#134507ff", "#1b5502ff"] },
  { id: 'gray', name: 'Gray', hex: '#585561', colors: ["#0e0e18ff", "#201e2bff", "#373340ff", "#585561ff", "#797580ff", "#a2a0a4ff"] },
  { id: 'green', name: 'Green', hex: '#0b5c2f', colors: ["#101820ff", "#192832ff", "#214437ff", "#0b5c2fff", "#2f8136ff", "#64a42cff"] },
  { id: 'lavender', name: 'Lavender', hex: '#7141b2', colors: ["#13112dff", "#2b225aff", "#402e82ff", "#7141b2ff", "#a966ddff", "#d085edff"] },
  { id: 'leather', name: 'Leather', hex: '#704325', colors: ["#1d0f0eff", "#311210ff", "#4b2b13ff", "#704325ff", "#75502dff", "#9a6f37ff"] },
  { id: 'maroon', name: 'Maroon', hex: '#682121', colors: ["#1d131eff", "#400b1fff", "#551c22ff", "#682121ff", "#832121ff", "#ae424aff"] },
  { id: 'navy', name: 'Navy', hex: '#322d6a', colors: ["#180716ff", "#20102bff", "#281e41ff", "#322d6aff", "#3c49adff", "#466ac9ff"] },
  { id: 'orange', name: 'Orange', hex: '#d75b1a', colors: ["#301723ff", "#5f1d1bff", "#9c3f23ff", "#d75b1aff", "#ef7e19ff", "#ffa749ff"] },
  { id: 'pink', name: 'Pink', hex: '#ae424a', colors: ["#1d131eff", "#54242eff", "#6c3536ff", "#ae424aff", "#c36072ff", "#e08080ff"] },
  { id: 'purple', name: 'Purple', hex: '#411357', colors: ["#180716ff", "#13112dff", "#261044ff", "#411357ff", "#621e78ff", "#813089ff"] },
  { id: 'red', name: 'Red', hex: '#82171c', colors: ["#1d131eff", "#400b1fff", "#651117ff", "#82171cff", "#ab1e1eff", "#cd2429ff"] },
  { id: 'rose', name: 'Rose', hex: '#77372b', colors: ["#1d131eff", "#301723ff", "#562323ff", "#77372bff", "#8a3d28ff", "#b05f3cff"] },
  { id: 'sky', name: 'Sky', hex: '#9fbbcb', colors: ["#1a0d18ff", "#313148ff", "#586b90ff", "#9fbbcbff", "#c6eefdff", "#ffffffff"] },
  { id: 'slate', name: 'Slate', hex: '#818b8b', colors: ["#1d131eff", "#31313eff", "#4a5057ff", "#818b8bff", "#b3afa1ff", "#e5e6c7ff"] },
  { id: 'source', name: 'Source', hex: '#62351c', colors: ["#1d131eff", "#411e05ff", "#4b2b13ff", "#62351cff", "#744b30ff", "#996b4aff"] },
  { id: 'tan', name: 'Tan', hex: '#b78c41', colors: ["#3e2613ff", "#684415ff", "#986a20ff", "#b78c41ff", "#b7996aff", "#cfc587ff"] },
  { id: 'teal', name: 'Teal', hex: '#156c99', colors: ["#180716ff", "#1b2b47ff", "#0e4e72ff", "#156c99ff", "#0098b2ff", "#00cfdfff"] },
  { id: 'walnut', name: 'Walnut', hex: '#744b30', colors: ["#2b1c1dff", "#3e2613ff", "#62351cff", "#744b30ff", "#996b4aff", "#a17c50ff"] },
  { id: 'white', name: 'White', hex: '#c4b59f', colors: ["#281820ff", "#4d4a5dff", "#958080ff", "#c4b59fff", "#e5e6c7ff", "#ffffffff"] },
  { id: 'yellow', name: 'Yellow', hex: '#d99431', colors: ["#301723ff", "#5f2f25ff", "#ba5b23ff", "#d99431ff", "#f3c03fff", "#ffe360ff"] },
];

export const METAL_PALETTES: ColorRamp[] = [
  { id: 'brass', name: 'Brass', hex: '#836332', colors: ["#1a1213ff", "#2e2533ff", "#61482cff", "#836332ff", "#af8a35ff", "#fdd082ff", "#fdf5ccff"] },
  { id: 'bronze', name: 'Bronze', hex: '#966600', colors: ["#4f2313ff", "#573726ff", "#6d4a00ff", "#966600ff", "#bf8200ff", "#e7a820ff", "#fbe3b0ff"] },
  { id: 'ceramic', name: 'Ceramic', hex: '#594435', colors: ["#181009ff", "#2b1c1dff", "#32251aff", "#594435ff", "#7d604dff", "#ba9069ff", "#fbe3b0ff"] },
  { id: 'copper', name: 'Copper', hex: '#973c23', colors: ["#4f2313ff", "#691503ff", "#7b2008ff", "#973c23ff", "#9d5427ff", "#ec855cff", "#ffc95aff"] },
  { id: 'gold', name: 'Gold', hex: '#966600', colors: ["#2e2533ff", "#4f2313ff", "#6d4a00ff", "#966600ff", "#dc6f35ff", "#ffc95aff", "#ffff61ff"] },
  { id: 'iron', name: 'Iron', hex: '#29253a', colors: ["#000000ff", "#1d131eff", "#1b192bff", "#29253aff", "#343043ff", "#484152ff", "#726b7eff"] },
  { id: 'silver', name: 'Silver', hex: '#4a5057', colors: ["#1d131eff", "#2e2533ff", "#31313eff", "#4a5057ff", "#818b8bff", "#d6e1d3ff", "#ffffffff"] },
  { id: 'steel', name: 'Steel', hex: '#726b7e', colors: ["#1d131eff", "#2e2533ff", "#4d4a5dff", "#726b7eff", "#867e7fff", "#c4b59fff", "#ffffffff"] },
];

export const SKIN_PALETTES_EXPANDED: ColorRamp[] = [
  { id: 'amber', name: 'Amber', hex: '#ea9f54', colors: ["#281716ff", "#9e3e37ff", "#d28144ff", "#ea9f54ff", "#fdd082ff", "#fbe7a4ff", "#fbe7a4ff"] },
  { id: 'black', name: 'Black', hex: '#442725', colors: ["#000000ff", "#1a1213ff", "#2e1f1cff", "#442725ff", "#603429ff", "#7f4c31ff", "#7f4c31ff"] },
  { id: 'blue', name: 'Blue', hex: '#748da4', colors: ["#16171bff", "#46425dff", "#586b90ff", "#748da4ff", "#a9c9caff", "#c8e8e8ff", "#f8f3ebff"] },
  { id: 'bright_green', name: 'Bright Green', hex: '#5b8f11', colors: ["#02280eff", "#06410eff", "#255e1dff", "#5b8f11ff", "#75ae23ff", "#99d248ff", "#d4d887ff"] },
  { id: 'bronze', name: 'Bronze', hex: '#7f4c31', colors: ["#1a1213ff", "#442725ff", "#644133ff", "#7f4c31ff", "#ae6b3fff", "#d38b59ff", "#d38b59ff"] },
  { id: 'brown', name: 'Brown', hex: '#76513a', colors: ["#120e10ff", "#412b29ff", "#5f4539ff", "#76513aff", "#9c663eff", "#b8773fff", "#b8773fff"] },
  { id: 'dark_green', name: 'Dark Green', hex: '#255e1d', colors: ["#011708ff", "#02280eff", "#06410eff", "#255e1dff", "#508a48ff", "#509e59ff", "#509e59ff"] },
  { id: 'fur_black', name: 'Fur Black', hex: '#14212c', colors: ["#040510ff", "#0a0e1bff", "#0d1621ff", "#14212cff", "#1b2c36ff", "#154259ff", "#265c78ff"] },
  { id: 'fur_brown', name: 'Fur Brown', hex: '#473730', colors: ["#000000ff", "#1e120eff", "#251b19ff", "#473730ff", "#624135ff", "#975b5aff", "#d79993ff"] },
  { id: 'fur_copper', name: 'Fur Copper', hex: '#63200b', colors: ["#0f0506ff", "#200c0dff", "#3a130eff", "#63200bff", "#81310aff", "#b6550eff", "#d28102ff"] },
  { id: 'fur_gold', name: 'Fur Gold', hex: '#ac5d1f', colors: ["#200808ff", "#331313ff", "#552b15ff", "#ac5d1fff", "#e09e2bff", "#fccf56ff", "#ffe67dff"] },
  { id: 'fur_grey', name: 'Fur Grey', hex: '#55585f', colors: ["#0f0f11ff", "#17171bff", "#36363fff", "#55585fff", "#6a6e74ff", "#909699ff", "#d3d9daff"] },
  { id: 'fur_tan', name: 'Fur Tan', hex: '#975f43', colors: ["#222121ff", "#3a200eff", "#663a1aff", "#975f43ff", "#b88751ff", "#db8e60ff", "#e9bba0ff"] },
  { id: 'fur_white', name: 'Fur White', hex: '#8b9498', colors: ["#17171aff", "#1d1d21ff", "#484e57ff", "#8b9498ff", "#b8bbbcff", "#d8dcdcff", "#fafafaff"] },
  { id: 'green', name: 'Green', hex: '#228236', colors: ["#140c09ff", "#09320bff", "#19541dff", "#228236ff", "#39aa4eff", "#53bf71ff", "#adcca6ff"] },
  { id: 'lavender', name: 'Lavender', hex: '#a0a5bc', colors: ["#16171bff", "#393b44ff", "#787c8fff", "#a0a5bcff", "#c9d0eeff", "#fbece6ff", "#f8f3ebff"] },
  { id: 'light', name: 'Light', hex: '#e4a47c', colors: ["#271920ff", "#99423cff", "#cc8665ff", "#e4a47cff", "#f9d5baff", "#faece7ff", "#f8f3ebff"] },
  { id: 'olive', name: 'Olive', hex: '#ae6b3f', colors: ["#271920ff", "#442725ff", "#7f4c31ff", "#ae6b3fff", "#d38b59ff", "#e4a47cff", "#e4a47cff"] },
  { id: 'pale_green', name: 'Pale Green', hex: '#5f874d', colors: ["#271920ff", "#314829ff", "#456238ff", "#5f874dff", "#86b278ff", "#adcca6ff", "#f8f3ebff"] },
  { id: 'source', name: 'Source', hex: '#e4a47c', colors: ["#271920ff", "#99423cff", "#cc8665ff", "#e4a47cff", "#f9d5baff", "#faece7ff", "#f8f3ebff"] },
  { id: 'taupe', name: 'Taupe', hex: '#936849', colors: ["#271920ff", "#503734ff", "#785946ff", "#936849ff", "#ba8454ff", "#c7935fff", "#c7935fff"] },
  { id: 'zombie_green', name: 'Zombie Green', hex: '#839f6e', colors: ["#101925ff", "#074337ff", "#4a7a69ff", "#839f6eff", "#d4d887ff", "#f2f0c4ff", "#f8f3ebff"] },
];