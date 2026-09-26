# Post Evaluation

## Description

This markdown is filled with aspects that get evaluated, the evaluation process, and things that need to change.

## Evaluation Aspects

- The flow of guest and its interaction with staff vs real life flow
- This app guest booking data needed vs real life boarding house booking data needed 
- Database structure

## Pre Evaluation Guest Flow

Guest arrive at the boarding house -> guest freely roam and search for room available -> scan qr outside the room -> book the room -> go back to the front desk to pay -> system send the room pin through whatsapp -> user enter the room and access room dashboard -> guest can call staff or checkout in the room dashboard -> guest pressed checkout -> guest leaves

Problems:
1. Guest shouldn't have the ability to roam freely
2. Guest must always come to the front desk after entering the facility
3. The frontdesk is always close to the main door, the guest will have to scan qr outside the room and walk back again in the front desk.

## Pre Evaluation Booking Data Needed

Guest book inside the web, filling out full name, phone number, duration, room addons, and payment method (only cash).

Problems:
1. The data doesnt reflect real life indonesian boarding house criteria.
2. Guest data needed is too little.

## Evaluation Results

- Guest flow need to be fixed, guest always get charged before they book
- Current Booking flow is not efficient
- Guest data needed for booking doesnt reflect real boarding house criteria
- Cannot create rooms inside admin panel
- room Addons maximum borrow implementation is ambigous

## Post Evaluation Guest Flow
Guest arrives at the boarding house -> guest go to the front desk and ask about available rooms and their price -> staff look at the admin panel and give the guest a list of the room available -> guest want to book a room -> staff ask about every data the guest need and room addons if needed -> the guest give the staff the data needed -> staff input them and ask for payment -> guest pay -> staff approved the booking inside the app and told the guest the room PIN -> guest can check the whatsapp too for PIN -> guest enter the room and access room dashboard -> guest can call staff or checkout in the room dashboard -> guest pressed checkout -> guest leaves

problems:
1. The web itself need a rebuild inside the admin panel to allow staff to create booking, filling out the form and approving payment.
2. The web need a removal for user self book.

## Post Evaluation Booking Data Needed

1. Full Name
2. ID Card / Student Card Photo Scan
3. NIK
4. Birthday Date
5. Sex
6. Phone Number
7. Home Address
8. Profession
9. Name of workplace / school
10. Emergency Phone Number
11. Name of The Emergency Phone Number
12. Emergency Phone Number relation (parent, son, brother, etc)
13. Stay Duration
14. Room Addons

## Room Addons Ambigous Maximum Borrow

borrowMaximum is placed inside the addons table. If the maximum borrow of an addons is 10, then room A borrowed 10, but room B can also borrow 10. Need to redesign the structure.

## My Proposed Fix

We need to fix the room addons first.
Then for the guest flow and booking data needed, first we have to tweak the database to match the current booking data needed. 
Second, we can delete the user self book page and create a button for room booking inside the admin panel in the room card if the room is available. 
Third, re assess the endpoint security to only allow admin to create booking, but still let the user see their booking approval status page.
And then for the room add and delete inside the admin panel, we have to think again because the IoT simulation is handled by hardcoded bullMQ.