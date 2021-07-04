class CookieManager {
  //Thx
  //https://www.w3schools.com/js/js_cookies.asp
  static setCookie(cname, cvalue) {
    let d = new Date();
    d.setTime(d.getTime() + 9000 * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  //Thx
  //https://www.w3schools.com/js/js_cookies.asp
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
    return "";
  }

  static touchCookie(cname, defaultValue) {
    const cookieValue = this.getCookie(cname);
    if (cookieValue !== "") {
      return cookieValue;
    } else {
      this.setCookie(cname, defaultValue);
      return defaultValue;
    }
  }
}

export default CookieManager;
