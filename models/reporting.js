'use strict';

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var Schema = mongoose.Schema;


var ReportingSchema = new Schema({
    check_in: {type: Date, default:null},
    check_out: {type: Date, default:null},
    lunch_in: {type: Date, default:null}, // writes new date if employee is going have a lunch
    lunch_out: {type: Date, default:null}, // ..coming from lunch
    go_out: {type: Date, default:null}, // .. go out during the work hours
    come_back: {type: Date, default:null},// .. come back to work during current work day
    // created_at: { type: Date, default: Date.now },
    // updated_at: { type: Date, default: Date.now },
    report: { type: String },
    employee: { // position id of employee
        type: Schema.Types.ObjectId,
        ref:'Employee'
    },
    //curentDayMinutes
}, {
    timestamps: true
});

ReportingSchema.pre('save', function (next) {
    // var currentDate = new Date();
    //
    // this.updated_at = currentDate;
    //
    // if(!this.created_at)
    //     this.created_at = currentDate;


    next();
});
ReportingSchema.methods.calcTime = function () {
    var fullTimeHours = null;
    var fullTimeMinutes = null;
    var totalTimeInMinutes = null;
    var fullTimeMilliseconds = null;
    var outWorkMinutes = null;
    var lunchTimeMinutes = null;

    if(this.check_in && this.check_out){
        console.log(this.check_in);
        console.log(this.check_out);
        fullTimeHours =
            this.check_out.getHours() - this.check_in.getHours();
        fullTimeMinutes = (this.check_out.getHours() * 60 + this.check_out.getMinutes())
            - (this.check_in.getHours() * 60 + this.check_in.getMinutes());
        //fullTimeMilliseconds = this.check_out.getMilliseconds() - this.check_in.getMilliseconds();

        if (this.go_out && this.come_back){
            outWorkMinutes = (this.come_back.getHours() * 60 + this.come_back.getMinutes())
                - (this.go_out.getHours() * 60 + this.go_out.getMinutes());
        }

        if(this.lunch_in && this.lunch_out){
            lunchTimeMinutes = (this.lunch_out.getHours() * 60 + this.lunch_out.getMinutes())
                - (this.lunch_in.getHours() * 60 + this.lunch_in.getMinutes());
        }

        totalTimeInMinutes = fullTimeMinutes - outWorkMinutes - lunchTimeMinutes;
        console.log("Get interval in hours: "+ fullTimeHours);
        console.log("Get interval in min: " + fullTimeMinutes);

        return {
            minutes : fullTimeMinutes, // whole time begiin
            lunchTime : lunchTimeMinutes,
            outWorkDW : outWorkMinutes,
            totalTimeInMinutes: totalTimeInMinutes
        };
    } else {
        console.log("Вы не сделали чекаут!");
        console.log(this.check_in  + this.check_out);
        console.log(this.check_out);

    }
};


module.exports = mongoose.model('Reporting', ReportingSchema);