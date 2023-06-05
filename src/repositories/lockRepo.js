const { Lock } = require('../domain/lock.js');
const userRepo = require('../repositories/userRepo.js');

module.exports = {
    // Returns single lock if id supplied or all users
    // undefined if failure
    Get: async function(res, id) {
        // Find lock/s
        var lock;
        if (id === undefined) {
            lock = await Lock.find();
        } else {
            lock = await Lock.find({ _id: id });
        }

        // Deal with potential null values
        if (lock === null) {
            console.log("Failed to find lock with id: " + id);
            res.status(400).json("Failed to find lock/s.");
            return undefined;
        }

        return lock;
    },

    // Returns lock, undefined if failure
    Create: async function(req, res, ownerID) {
        var lock = new Lock(req.body);

        // Check for required values
        if (lock.serial == null) {
            console.log("Failed to create lock. Wrong arguments supplied.");
            res.status(400).json("Wrong arguments supplied.");
            return undefined;
        }

        // Does lock with serial exist
        const foundLock = await Lock.find({ serial: lock.serial });
        if (foundLock.length != 0) {
            console.log("Failed to create lock. Lock with serial already exists.");
            res.status(400).json("Lock with serial already exists.");
            return undefined;
        }

        // Find owner
        var owner = await userRepo.Get(res, ownerID);
        if (owner === undefined) {
            res.status(400).json("Failed to find owner.");
            return undefined;
        }

        lock.owner = owner[0]._id;
        lock.active = false;
        lock.save();
        return lock;
    },

    // To be implemented:
    Update: async function(req, res) {
        // Get lock id, lock and verify result found
        const id = req.body._id;
        const lock = await Lock.find({ _id: id });
        if (lock.length == 0) {
            console.log("Failed to update lock. Could not find lock with ID: " + id);
            res.status(400).json("Couldn't find lock in database.");
            return undefined;
        }
        lock = lock[0];

        // Update properties
        if (req.body.serial != null)
            lock.serial = req.body.serial;

        if (req.body.name != null)
            lock.name = req.body.name;

        if (req.body.location != null)
            lock.location = req.body.location;

        if (req.body.active != null)
            lock.active = req.body.active;

        if (req.body.owner != null)
            lock.owner = req.body.owner;

        // Save changes and return updated lock
        await lock.save();
        return lock;
    },

    // To be implemented:
    Delete: async function(req, res, id) {

    }
}