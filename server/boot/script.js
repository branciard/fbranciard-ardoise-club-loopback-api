module.exports = function (app) {
  var cloudantDB = app.dataSources.cloudant;

  // Parse VCAP_SERVICES if running in Bluemix
  if (process.env.VCAP_SERVICES)
  {
    var env = JSON.parse(process.env.VCAP_SERVICES);

    // Debugging
    for (var svcName in env) {
      console.error(svcName);
    }
    console.error(env);
  }
  else {
    console.error("no VCAP_SERVICES");
  }


  cloudantDB.automigrate('Profile', function (err) {
    if (err) throw (err);




    var Profile = app.models.Profile;
    Profile.find({ where: { username: 'Admin' }, limit: 1 }, function (err, users) {
      if (JSON.stringify(users) === '[]') {
       Profile.create([
          { username: 'Admin', email: 'francoisbranciard@gmail.com', password: 'abcdef' }
        ], function (err, users) {
          if (err) return debug(err);

          var Role = app.models.Role;
          var RoleMapping = app.models.RoleMapping;

          Role.destroyAll();
          RoleMapping.destroyAll();

          //create the admin role
          Role.create({
            name: 'admin'
          }, function (err, role) {
            if (err) return debug(err);

            //make admin
            role.principals.create({
              principalType: RoleMapping.USER,
              principalId: users[0].id
            }, function (err, principal) {
              if (err) throw (err);
            });
          });
        })
      }
    });
  });
};