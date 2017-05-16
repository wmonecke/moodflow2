$(document).ready(() => {
// ------------------------------ DEFINING USER -------------------------------
  function User(name,
                gender,
                timezone,
                location,
                id
               ) {
    this.name                 = name;
    this.gender               = gender;
    this.timezone             = timezone;
    this.location             = location;
    this.id                   = id; // null until user goes premium
    this.favoriteVideos       = [];
    this.favoriteBackgrounds  = [];
    this.searchbar            = true;
    this.todolist             = true;
    this.firstTimeLogin       = true;
    this.firstTimeMeditating  = true;
  }

  User.prototype.searchbarON  = () => {
    this.searchbar = true;
  };
  User.prototype.searchbarOFF = () => {
    this.searchbar = false;
  };
  User.prototype.hasLoggedIn  = () => {
    this.firstTimeLogin = false;
  };
  User.prototype.hasMeditated = () => {
    this.firstTimeMeditating = false;
  };
// ------------------------------- APP LOGIC ----------------------------------


});
