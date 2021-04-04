const DitherMethods = {
  None: { uniqueId: 0, name: "None", localeKey: "SETTINGS-DITHER-NONE" },
  FloydSteinberg: { uniqueId: 1, name: "Floyd-Steinberg" },
  Bayer44: { uniqueId: 2, name: "Bayer (4x4)" },
  Bayer22: { uniqueId: 3, name: "Bayer (2x2)" },
  Ordered33: { uniqueId: 4, name: "Ordered (3x3)" },
  MinAvgErr: { uniqueId: 5, name: "MinAvgErr" },
  Burkes: { uniqueId: 6, name: "Burkes" },
  SierraLite: { uniqueId: 7, name: "Sierra-Lite" },
  Stucki: { uniqueId: 8, name: "Stucki" },
  Atkinson: { uniqueId: 9, name: "Atkinson" },
};

export default DitherMethods;
