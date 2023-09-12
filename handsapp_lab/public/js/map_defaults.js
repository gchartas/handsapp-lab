// Copyright (c) 2023, George Chartas and contributors
// For license information, please see license.txt

// Make sure we have a dictionary to add our custom settings
const map_settings = frappe.provide("frappe.utils.map_defaults");
// Center and zoomlevel can be copied from the URL of
// the map view at openstreetmap.org.

// New default location (middle of germany).
map_settings.center = [37.7783, 20.7470];
// new zoomlevel: see the whole country, not just a single city
map_settings.zoom = 11;