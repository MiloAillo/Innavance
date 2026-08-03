import { Transform, Type } from "class-transformer";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class CallInnkeeperDto {
    @IsNotEmpty()
    @Transform(({ value }) => {
        if (value === "true") return true       // return true if value is true string
        if (value ===  "false") return false    // or, return false if value is false string
        return value                            // or, return the original value if neither
    })
    @IsBoolean()                                // check if the value is boolean or not
    value!: boolean
}