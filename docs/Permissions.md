# Permissions
Trellis uses an access control model based on permissions. The permissions are assigned to roles and each user has a single role. This make it simple to control and modify the types of access that each user has to Trellis without changing permissions for each user directly.

The default permissions in Trellis are **admin**, **supervisor** and **surveyor**. The **admin** role has access to everything in Trellis and the permissions for this role cannot be changed. By default, the **surveyor** role has the minimum amount of access required to complete forms. The **supervisor** role has access to everything that a **surveyor** has access to and they are also able directly modify more parts of the data. View the permissions for a full picture of what each role has access to.

## Roles
Roles can be added and removed as needed. To simplify the process of creating and modifying roles we've created a copy feature which will copy all of the permissions from one role to another. This process will overwrite any existing permissions on the chosen role.
