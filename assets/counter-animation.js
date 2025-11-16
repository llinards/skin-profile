const yearsOfExperienceNum = document.getElementById('years-of-experience-num');
const numberOfServicesNum = document.getElementById('number-of-services-num');
const teamMembersNum = document.getElementById('team-members-num');


const createOdometer = (el, value) => {
    const odometer = new Odometer({
        el: el,
        value: 0,
    });

    odometer.update(value)
};

createOdometer(yearsOfExperienceNum, yearsOfExperienceNum.innerHTML);
createOdometer(numberOfServicesNum, numberOfServicesNum.innerHTML);
createOdometer(teamMembersNum, teamMembersNum.innerHTML);

