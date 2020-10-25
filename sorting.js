"use strict";
var selected = {};

class Group {
	constructor(max_value) {
		this.max_value = max_value;
		this.value = {}
		this.currentGroup = 0
	}
	add(base, added) {
		if (this.value[this.currentGroup] == undefined) {
			this.value[this.currentGroup] = [base];
			delete selected[base];

		}
		this.value[this.currentGroup].push(added);
		delete selected[added];

	}


}

//def sorting(Preferences: dict, max):
function sorting(preferences, max) {
	//  # Preferences is a hashmap with the names of the student who selected it as keys and the students they selected as values
	//  selected = {}
	//  for name, pref in Preferences:
	//      selected[pref] += name
	for (var i = 0; i < Object.keys(preferences).length; i++) {
		var name = Object.entries(preferences)[i][0];
		var pref = Object.entries(preferences)[i][1];
		if (selected[name] == undefined) {
			selected[name] = [];
		}
		for (var j = 0; j < pref.length; j++) {
			if (selected[pref[j]] == undefined) {
				selected[pref[j]] = [];
			}
			selected[pref[j]].push(name);
		}
	}

	for (var i = 0; i < Object.keys(selected).length; i++) {
		if (selected[Object.keys(selected)[i]] == undefined) {
			selected[Object.keys(selected)[i]] = [0]
		}
	}
	const sortable = Object.entries(selected)
		.sort(([, a], [, b]) => a - b)
		.reduce((r, [k, v]) => ({
			...r,
			[k]: v
		}), {});
	console.log(sortable);
	selected = sortable;
	var groups = new Group(max);

	function makeGroup(nameIn, escapeValue) {
		if (escapeValue < Object.keys(preferences).length * 2 + 5) {
			if (selected[nameIn] != undefined) {
				var selectedBy = selected[nameIn];
				if (selectedBy.length > 0) {
					//for person in selectedBy:
					selectedBy.forEach(person => {
						if (selected[person] != undefined) {
							// $person is a singular person who selected $name
							if (preferences[person].includes(nameIn)) {
								groups.add(nameIn, person);
								if (groups.max_value - 1 > groups.value[groups.currentGroup].length) {
									makeGroup(person);
								} else if (groups.max_value - 1 == groups.value[groups.currentGroup].length) {
									groups.add(nameIn, Object.keys(selected)[0]);
									groups.currentGroup++;
								} else if (groups.max_value == groups.value[groups.currentGroup].length) {
									groups.currentGroup++;
								}
							}
						}
					});
				}
			}
		} else {
			groups.add(nameIn, Object.keys(selected)[0]);
			if (groups.max_value == groups.value[groups.currentGroup].length) {
				groups.currentGroup++;
			} else if (groups.max_value - 1 > groups.value[groups.currentGroup].length) {
				makeGroup(person);
			}
			i = 0
		}


	}
	for (var i = 0; 0 != Object.keys(selected).length; i++) {
		// $name is the person who has been selected by $selectedBy which is a group
		makeGroup(Object.keys(selected)[i], i);

	}
	return (groups.value);
}
/*
var group = {
	'Alexis Ng': ['Tyberious Slayton', 'Isabella Slayton'],
	'Tyberious Slayton': ['Alexis Ng'],
	'Isabella Slayton': ['Tyberious Slayton', 'Alexis Ng'],
	'Domi Keszei': ['Akilan Babu', 'Richard Nam'],
	'Alejandro': [],
	'Richard Nam': ['Domi Keszei'],
	'Akilan Babu': ['Domi Keszei', 'Matthew Kin'],
	'Matthew Kin': []
}
console.log(sorting(group, 4));
*/

//    # selected is a hashmap with the names of the student who were selected as keys and the students they were selected by as values
//    #select people picked 1 time and go from there
//    groups = group(max)
//
//    def makeGroup(nameIn):
//        selectedBy = selected[nameIn]
//        if selectedBy.len > 0:
//            for person in selectedBy:
//                # $person is a singular person who selected $name
//                if nameIn in Preferences[person]:
//                    groups.add(nameIn, person)
//                    if groups.sizeOK:
//                        makeGroup(person)
//                    else:
//                        groups.add(selected[0])
//
//    for name in selected:
//        # $name is the person who has been selected by $selectedBy which is a group
//        makeGroup(name)
//
//
//'''
//def buildGroup(group, base, add):
//	#crosscheck student
//	#find base attempt to add
//	#recursive add each student based on the last one added
//	#if ran out, fill group with the next person on list, or if one slot is missing a 0 selected
//'''