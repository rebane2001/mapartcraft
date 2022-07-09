class CookieManager {
  static init() {
    // Handle cookie migration
    const cookieNames = ["presets", "mcversion", "customBlocks"];
    cookieNames.forEach(name => {
      if (this.getCookie(`mapartcraft_${name}`) === null && this.getCookie(name) !== null) {
        this.setCookie(`mapartcraft_${name}`, this.getCookie(name));
      }
    });
  }

  //Thx
  //https://www.w3schools.com/js/js_cookies.asp
  static setCookie(cname, cvalue) {
    let d = new Date();
    d.setTime(d.getTime() + 9000 * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  static getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  }

  static touchCookie(cname, defaultValue) {
    const cookieValue = this.getCookie(cname);
    if (cookieValue !== null) {
      return cookieValue;
    } else {
      this.setCookie(cname, defaultValue);
      return defaultValue;
    }
  }
}

export default CookieManager;
