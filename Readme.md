
# AirBnb Private API

### Attention this is Unofficial AirBnb API based on Android Application. Use this API at you own risk and only for educational purposes

## If you like this tool then please Star it

<a href="https://www.buymeacoffee.com/Usom2qC" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-blue.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

## Features
*   Manage listings
*   Manage calendar
*   Manage reservations
*   Manage own profile
*   Manage conversations
*   Other things related to AirBnb
*   **Everything is returned in JSON format**

## TO DO
*   Improve documentation
*   Support more endpoints
*   Store session in redis(currently in json file)
*   Add tests

## Content
- [Installation](#installation)
- [Usage](#usage)
	- [Import Library](#import-library)
	- [Authorization By Email](#authorization-by-email)
	- [Authorization By Phone](#authorization-by-phone)
	- [_load_session()](#_load_session)
	- [Profile](#profile)
	    - [_get_my_profile()](#_get_my_profile)
        - [_get_user_profile()](#_get_user_profile)
        - [_get_wishlists()](#_get_wishlists)
	- [Search](#search)
	    - [_get_listings_from_search()](#_get_listings_from_search)
	- [Listing](#listing)
	    - [_get_listings()](#_get_listings)
	- [Calendar](#calendar)
	    - [_update_calendar_price()](#_update_calendar_price)
        - [_update_calendar_availability()](#_update_calendar_availability)
        - [_update_calendar_note()](#_update_calendar_note)
        - [_update_calendar_smart_pricing()](#_update_calendar_smart_pricing)
	- [Messages](#messages)
	    - [_messaging_syncs()](#_messaging_syncs)
        - [_get_threads_ids()](#_get_threads_ids)
        - [_get_thread_by_id()](#_get_thread_by_id)
        - [_get_threads_full()](#_get_threads_full)
	- [Reservations](#reservations)
	    - [_get_reservations()](#_get_reservations)
        - [_get_reservation_details()](#_get_reservation_details)
- [Examples](#examples)
- [Options](#options)

**Possible errors**
*   If there will be let me know

## Installation

**Install from NPM**
```sh
$ npm i airbnb-private-api
```

**Install from YARN**
```sh
$ yarn add airbnb-private-api
```

## Usage

### Import library
```javascript
const { AirBnbClient } = require('airbnb-private-api');
```
#### Authorization By Email
##### _authentication_by_email
 - **If the request was successful then you don't need to execute this method anymore. All required AUTH data will be saved to a JSON file**
 - Authorization by using **email** and **password**
 - New device credentials will be generated
 - To make it convenient the login token and the device details will be saved to a file {session_path}/{email}.json for the future usage
```javascript  
let airbnb = new AirBnbClient({
    email: 'email@example.com',
    password: 'password',
    session_path: '/user/bob/Downloads',
});
(async() => {
    try {
        let response = await airbnb._authentication_by_email();
        console.log('Login details: ', response);
    } catch (error) {
        console.log('Error: ', error);
    }
})()
```

#### Authorization By Phone
##### _authentication_by_phone
 - **This is the best way to authorize to the AirBnb. In that case chances of receiving checkpoint are drastically lower**
 - **If the request was successful then you don't need to execute this method anymore. All required AUTH data will be saved to a JSON file**
 - Authorization by using **phone**
 - New device credentials will be generated
 - To make it convenient the login token and the device details will be saved to a file {session_path}/{email}.json for the future usage
```javascript  
let airbnb = new AirBnbClient({
    phone: '18009009899',
    session_path: '/user/bob/Downloads',
});
(async() => {
    try {
        // First you need to send request to receive the SMS code
        await airbnb._send_auth_code_to_phone();

        // After receiving the SMS code you need to submit it in order to receive the login credentials
        let response = await airbnb._authentication_by_phone(SMS_CODE);
        console.log('Login details: ', response);
    } catch (error) {
        console.log('Error: ', error);
    }
})()
```

#### _load_session
 - Before calling any other method, we need to load an active session
 - Method **_load_session()** will load the device credentials and auth token from the a **{session_path}/{email}.json**
```javascript  
(async() => {
    try {
        await airbnb._load_session();
    } catch (error) {
        console.log('Error: ', error);
    }
})()
```
#### Profile
##### _get_my_profile
 - Method is returning all your profile information
```javascript  
(async() => {
    try {
        let response await airbnb._get_my_profile();
        console.log('My profile information: ', response)
    } catch (error) {
        console.log('Error: ', error);
    }
})()
```

##### _get_user_profile
 - Method is returning public user details
 - **USER_ID** - positive number(>0)
```javascript  
(async() => {
    try {  
        let response = await airbnb._get_user_profile(USER_ID);
        console.log('User information: ', response)
    } catch (error) {
        console.log('Error: ', error);
    }
})()
```

##### _get_wishlists
 - Method is returning items that are located in the Saved section of your profile
 - Method is accepting an object with **_limit** and **_offset** values
 - **_limit** - limit of items to display. **Defaut value: 10**
 - **_offset** - number of items to skip. **Default value: 0**
```javascript  
(async() => {
    try {  
        let response = await airbnb._get_wishlists({ _limit: 10, _offset: 0});
        console.log('Saved Items: ', response)
    } catch (error) {
        console.log('Error: ', error);
    }
})()
```
#### Search
##### _get_listings_from_search
 - Method will return ARRAY of home listings from a search result
 - Method is accepting an object:
 ```javascript
 {
    // Number of items to return: {number default: 30}
    _limit, 
    
    // Number of items to skip: {number default: 0}
    _offset,
    
    // Number of adults: {number default: 0}
    adults,
    
    // Number of children: {number default: 0}
    children,
    
    // Number of infants: {number default: 0}
    infants,
    
    // ISO Check In date. For example: '2020-02-17': {string default: ''}
    checkin, 

    // ISO Check Out date. For example: '2020-02-20': {string default: ''}
    checkout, 

    // Search query. For example: Boston, MA, USA : {string default: ''}
    query, 

    // Array of amenities ID's: {array default: number[]}
    // Some of the ID's that i figured out
    // 30 - Heating
    // 44 - Hangers
    // 4 - WiFi
    // 8 - Kitchen
    // 45 - Hair Drier
    // 41 - Shampoo
    // 5 - AC
    // 33 - Washer
    // 34 - Dryer
    // 27 - Fireplace
    // 46 - Iron
    // 47 - Laptop friendly workspace
    // 58 - Tv
    // 64 - High chair
    // 58 - Self check in
    // 35 - Smoke alarm
    // 36 - Carbon monoxide alarm
    // 78 - Private bathroom
    // 12 - Pets allowed
    // 9 - Free parking on premises
    // 25 - Hot Tub
    amenities, 
    
    // Array of room types: {array default: string[]}
    // Possible values: "Entire home/apt", "Private room", "Hotel room", "Shared room"
    room_types,

    // Show only instant bookings: {boolean default: false}
    ib, 

    // Show only superhosts: {boolean default: false}
    superhost,
    
    // Minimum price: {number default: }
    price_min,
    
    // Maximum price: {number default: }
    price_max,
    
    // Minimum bathrooms: {number default: }
    min_bathrooms,
    
    // Minimum bedrooms: {number default: }
    min_bedrooms,
    
    // Minimum beds: {number default: }
    min_beds,
}
 ```
  - If some values are empty then you will receive an empty array
```javascript  
(async () => {
    try {
        let response = await airbnb._get_listings_from_search({
            adults: 2,
            checkin: '2020-03-07',
            checkout: '2020-03-12',
            query: 'Boston, MA, USA',
            _limit: 50,
            amenities: [30, 44, 4, 8, 45, 12, 25],
            price_max: 689,
            price_min: 25,
            room_types: ['Private room'],
        });
        console.log('Saved Items: ', response);
    } catch (error) {
        console.log('Error: ', error);
    }
})();

```
#### Listing
##### _get_listings
 - Method is returning a list of your listed properties
 - Method is accepting an object with **id** and **_limit** values
 - **id** - listing id. If not specified then method will return **_limit** number of listings. **Defaut value: 0**
 - **_limit** - number of listings to return. **Default value: 10**
```javascript  
(async() => {
    try {  
        let response = await airbnb._get_listings({ _limit: 20 });
        console.log('My listings: ', response)
    } catch (error) {
        console.log('Error: ', error);
    }
})()
```

### Calendar
##### _update_calendar_price
 - Method is updating the price on the **listing_id** on the specified **dates**
 - Method is accepting an object with the **listing_id** , **daily_price** and **dates**
 - **listing_id**: **number** -  listing id
 - **daily_price**: **number** -  new price
 - **dates**: Array[ISO_DATE] - array of ISO dates. Date should be in ISO format. For example **['2020-02-18', '2020-02-19', '2020-02-28']**
```javascript  
(async() => {
    try {  
        let response = await airbnb._update_calendar_price({
            dates: ['2020-02-18', '2020-02-19', '2020-02-28'],
            listing_id: 1,
            daily_price: 12,
        });
        console.log('Result: ', response)
    } catch (error) {
        console.log('Error: ', error);
    }
})()
```

##### _update_calendar_availability
 - Method is updating availablity for the **listing_id**
 - Method is accepting an object with the **listing_id** , **availability** and **dates**
 - **listing_id**: **number** -  listing id
 - **availability**: **boolean** -  **true** available, **false** not available 
 - **dates**: Array[ISO_DATE] - array of iso dates. Date should be in ISO format. For example **['2020-02-18', '2020-02-19', '2020-02-28']**
```javascript  
(async() => {
    try {  
        let response = await airbnb._update_calendar_availability({
            dates: ['2020-02-18'],
            listing_id: 1,
            availability: true,
        });
        console.log('Result: ', response)
    } catch (error) {
        console.log('Error: ', error);
    }
})()
```

##### _update_calendar_note
 - Method is updating note on the **listing_id** for the specified **dates**
 - Method is accepting an object with the **listing_id** , **notes** and **dates**
 - **listing_id**: **number** -  listing id
 - **notes**: **string** -  any string
 - **dates**: Array[ISO_DATE] - array of iso dates. Date should be in ISO format. For example **['2020-02-18', '2020-02-19', '2020-02-28']**
```javascript  
(async() => {
    try {  
        let response = await airbnb._update_calendar_note({
            dates: ['2020-02-18','2020-02-25'],
            listing_id: 1,
            notes: "Blah blah blah",
        });
        console.log('Result: ', response)
    } catch (error) {
        console.log('Error: ', error);
    }
})()
```

##### _update_calendar_smart_pricing
 - Method is enabling or disabled smart pricing on the **listing_id** for the specified **dates**
 - Method is accepting an object with **listing_id** , **active** and **dates**
 - **listing_id**: **number** -  listing id
 - **active**: **boolean** -  **true** enabled, **false** disabled
 - **dates**: Array[ISO_DATE] - array of iso dates. Date should be in ISO format. For example **['2020-02-18', '2020-02-19', '2020-02-28']**
```javascript  
(async() => {
    try {  
        let response = await airbnb._update_calendar_smart_pricing({
            dates: ['2020-02-18','2020-02-25'],
            listing_id: 1,
            notes: "Blah blah blah",
        });
        console.log('Result: ', response)
    } catch (error) {
        console.log('Error: ', error);
    }
})()
```


#### Messages
##### _messaging_syncs
 - Method will synchronize latest messages from your profile
 - Method is accepting an object:
 ```javascript
 {
    //Profile type 'guest', 'host', 'experience_host' or 'guest_and_host': {string default: 'host'}
    type, 
    //Number of items to return: {number default: 10}
    _limit, 
 }
 ```
 - If someone will send you a message then you can retrieve details of the message(thread) by calling this method.
 Airbnb App is calling this method once in a while to sync all new messages with the App.
```javascript  
(async() => {
    try {  
        let response = await airbnb._messaging_syncs({ type:'guest_and_host' });
        console.log('Result: ', response)
    } catch (error) {
        console.log('Error: ', error);
    }
})()
```


##### _get_threads_ids
 - Method will return thread id's
 - Method is accepting an object with the **_limit** , **_offset** and **type**
 - **_limit**: **number** -  number of items to return: **Default 10**
 - **_offset**: **number** -  number of items to skip: **Default 0**
 - **type**: **string** - inbox type. Can be 'guest', 'host', 'experience_host' or 'guest_and_host'. **Default 'host'**
```javascript  
(async() => {
    try {  
        let response = await airbnb._get_threads_ids({ type:'guest_and_host', _limit: 20});
        console.log('List of thread ids: ', response)
    } catch (error) {
        console.log('Error: ', error);
    }
})()
```

##### _get_thread_by_id
 - Method will return conversations from a specific thread id(conversation id)
 - Method is accepting an object:
```javascript
{
    //Thread id: {number default: null}
    id, 
}
```
```javascript  
(async() => {
    try {  
        let response = await airbnb._get_thread_by_id({ id: 1212 });
        console.log('Conversation details: ', response)
    } catch (error) {
        console.log('Error: ', error);
    }
})()
```

##### _get_threads_full
 - The more threads you request the longer request will execute
 - Method will return full thread(conversation) data for the last **_limit** threads
 - Method is accepting an object with the **_limit** , **_offset** and **type**
 - **_limit**: **number** -  number of items to return: **Default 10**
 - **_offset**: **number** -  number of items to skip: **Default 0**
 - **type**: **string** - inbox type. Can be 'guest', 'host', 'experience_host' or 'guest_and_host'. **Default 'host'**
```javascript  
(async() => {
    try {  
        let response = await airbnb._get_threads_full({ type:'guest', _limit: 5});
        console.log('Threads: ', response)
    } catch (error) {
        console.log('Error: ', error);
    }
})()
```

#### Reservations
##### _get_reservations
 - Method will return a (**_limit** ) number of reservations
 - Method is accepting an object:
 ```javascript
 {
    //Number of items to return: {number default: 30}
    _limit, 

    //Number of items to skip: {number default: 0}
    _offset,
    
    //ISO date. For example '2020-02-17': {string default: CURRENT_DATE}
    //Show only reservation from start_date
    start_date, 

    //ISO date. For example '2020-02-17': {string default: ''}
    //Show only reservation till end_date
    end_date, 

    //You can sort list by 'start_date', 'nights', 'number_of_guests' and 'status': {string default: 'start_date'}
    order_by, 

    //Include accepted reservations: {boolean default: true}
    include_accept, 

    //Include canceled reservations: {boolean default: false}
    include_canceled, 

    //Include reservations with additional verification request: {boolean default: false}
    include_checkpoint, 

    //Include canceled reservations: {boolean default: false}
    include_pending;
}
 ```

```javascript
(async() => {
    try {  
        let response = await airbnb._get_reservations({
            _limit: 20,
            _offset: 0,
            order_by: 'nights',
            end_date: '2020-04-17'
        });
        console.log('Reservation list: ', response)
    } catch (error) {
        console.log('Error: ', error);
    }
})()
```

##### _get_reservation_details
 - Method will return details from the specified **RESERVATION_ID**
 - **RESERVATION_ID** - string
 ```javascript  
(async() => {
    try {  
        let response = await airbnb._get_reservation_details(RESERVATION_ID);
        console.log('Reservation details: ', response)
    } catch (error) {
        console.log('Error: ', error);
    }
})()
```

#### Examples
```javascript
const { AirBnbClient } = require('airbnb-private-api');

let airbnb = new AirBnbClient({
    email: 'email@example.com',
    password: 'password',
    session_path: '/user/bob/Downloads',
});

// If we do not have an active session then we need to call _authentication_by_email() or _authentication_by_phone() method
// If authorization was succesfull(no errors) then Do Not Use this method anymore in the future
(async() => {
    try {
        await airbnb._authentication_by_email();
        let my_listings = await airbnb._get_listings({});
        console.log("My listings: ", my_listings)
    } catch (error) {
        console.log('Error: ', error);
    }
})()

// If we already have an active session then we need to load session details with method _load_session()
(async() => {
    try {
        await airbnb._load_session();
        let my_listings = await airbnb._get_listings({});
        console.log("My listings: ", my_listings)
    } catch (error) {
        console.log('Error: ', error);
    }
})()

```

#### Options
```javascript
let options = {
    //Email: {string default: ""}
    email: "exampl@mail.com",

    //Password: {string default: ""}
    password: 'bob',
    
    //Set proxy: {string default: ""}
    proxy: "",
    
    //Set currency: {string default: "USD"}
    currency: 'USD',
    
    //Set locale: {string default: "en-US"}
    locale: 'en-US',
    
    // Session is stored in json file and file it self should be stored somewhere
    // Set session file location: {string default: "{HOME_DIR}/Downloads}
    session_path:'/user/bob/Downloads',
};
```

***
<a href="https://www.buymeacoffee.com/Usom2qC" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-blue.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

----
License
----

**MIT**

**Free Software**
