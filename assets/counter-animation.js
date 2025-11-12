const yearsOfExperienceNum = document.getElementById('yearsOfExperienceNum');
const numberOfServicesNum = document.getElementById('numberOfServicesNum');
const teamMembersNum = document.getElementById('teamMembersNum');


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

