import Api from './api1'

export default class UserApi extends Api {

    constructor() {
        super();
    }

    /**
     * Log in user
     *
     * @returns {Promise<void>}
     */
    async login (email, password) {

        let token = btoa(`${email}:${password}`);
        let res = await this.customFetch(`${Api.getApiBaseUrl()}/user/${email}`, {
            method: "GET",
            headers: {
                'Authorization': `Basic ${token}`,
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (res.ok) {
            await this.setCurrentUser(await res.json());
        } else {
            throw Error(`Benutzername oder Passwort ist falsch.`);
        }
    }

    /**
     * Register a new user in the api
     *
     * @param newUser User object to register
     * @returns {Promise<void>}
     */
    async register (newUser) {
        let res = await this.customFetch(`${Api.getApiBaseUrl()}/user/add`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(newUser)
        });
        let createdUser = await res.json();
        this.setCurrentUser(createdUser);
    }

    /**
     *
     *
     * @param rating
     * @param email
     * @returns {Promise<this>}
     */
    async addRating (rating, email) {
        let res = await this.customFetch(`${Api.getApiBaseUrl()}/user/addRating/${email}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(rating)
        });
        if (res.ok) {
            return res.json();
        } else {
            throw new Error(`Failed to add rating:\n${JSON.stringify(rating)}`);
        }
    }

    /**
     * Fetch a user from the api
     *
     * @param email
     * @returns {Promise<User>} User
     */
    async fetchUser (email) {
        let res = await this.customFetch(`${Api.getApiBaseUrl()}/user/${email}`);
        return res.json();
    }

    /**
     * Put a user into local storage
     *
     * @param user
     */
    setCurrentUser (user) {
        localStorage.setItem("helpyUser", JSON.stringify(user));
    }

    /**
     * Fetch the current user from localstorage
     *
     * @returns {User} Logged in user
     */
    getCurrentUser () {
        let currentUser = JSON.parse(localStorage.getItem("helpyUser"));
        if(!currentUser) {
            this.handleUnauthorized();
        }
        return currentUser;
    }

    /**
     * Update the currently logged user with new data
     *
     * @param updatedUser
     * @returns {Promise<void>}
     */
    async updateCurrentUser (updatedUser) {
        let currentUser = this.getCurrentUser();
        let res = await this.customFetch(`${Api.getApiBaseUrl()}/user/update/${currentUser.email}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(updatedUser)
        });
        if (!res.ok) throw new Error(`Unable to update user ${currentUser.email}`);
    }

    /**
     * Deletes a user using its email
     *
     * @param email
     * @returns {Promise<void>}
     */
    async deleteUserByEmail (email) {
        let res = await this.customFetch(`${Api.getApiBaseUrl()}/user/remove/${email}`, {
            method: "DELETE"
        });
        localStorage.removeItem("helpyUser")
        if (!res.ok) throw new Error(`Unable to delete user ${email}`);
    }
}