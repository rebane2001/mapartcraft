import Flag_de from "./de/flag.svg";
import Strings_de from "./de/strings.json";

import Flag_ua from "./ua/flag.svg";
import Strings_ua from "./ua/strings.json";

import Flag_en from "./en/flag.svg";
import Strings_en from "./en/strings.json";

import Flag_eo from "./eo/flag.svg";
import Strings_eo from "./eo/strings.json";

import Flag_es from "./es/flag.svg";
import Strings_es from "./es/strings.json";

import Flag_et from "./et/flag.svg";
import Flag_et_pop from "./et/flag_pop.svg";
import Strings_et from "./et/strings.json";

import Flag_fr from "./fr/flag.svg";
import Strings_fr from "./fr/strings.json";

import Flag_it from "./it/flag.svg";
import Strings_it from "./it/strings.json";

import Flag_lt from "./lt/flag.svg";
import Strings_lt from "./lt/strings.json";

import Flag_pt from "./pt/flag.svg";
import Strings_pt from "./pt/strings.json";

import Flag_ru from "./ru/flag.svg";
import Strings_ru from "./ru/strings.json";

import Flag_zh_Hans from "./zh-Hans/flag.svg";
import Strings_zh_Hans from "./zh-Hans/strings.json";

import Flag_zh_Hant from "./zh-Hant/flag.svg";
import Strings_zh_Hant from "./zh-Hant/strings.json";

import Flag_pl from "./pl/flag.svg";
import Strings_pl from "./pl/strings.json";

const Locale = {
  en: { strings: Strings_en, flag: Flag_en },
  ua: { strings: Strings_ua, flag: Flag_ua },
  et: { strings: Strings_et, flag: Flag_et, flag_special: Flag_et_pop },
  lt: { strings: Strings_lt, flag: Flag_lt },
  ru: { strings: Strings_ru, flag: Flag_ru },
  de: { strings: Strings_de, flag: Flag_de },
  pl: { strings: Strings_pl, flag: Flag_pl },
  fr: { strings: Strings_fr, flag: Flag_fr },
  it: { strings: Strings_it, flag: Flag_it },
  pt: { strings: Strings_pt, flag: Flag_pt },
  es: { strings: Strings_es, flag: Flag_es },
  "zh-Hans": { strings: Strings_zh_Hans, flag: Flag_zh_Hans },
  "zh-Hant": { strings: Strings_zh_Hant, flag: Flag_zh_Hant },
  eo: { strings: Strings_eo, flag: Flag_eo },
};

export default Locale;
