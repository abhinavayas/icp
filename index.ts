import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt } from 'azle';
import { v4 as uuidv4 } from 'uuid';

type patientData = Record<{
    id: string;
    name: string;
    dob: string;
    description: string;
    photoURL: string;
    createdOn: nat64;
    latUpdated: Opt<nat64>;
}>

type patientDataPayload = Record<{
    dob: string;
    description: string;
    photoURL: string;
    name: string;
}>

type updatePatientFormat = Record<{
    description: string;
    photoURL: string;
}>

const patientsStorage = new StableBTreeMap<string, patientData>(0, 44, 1024);


$query;
export function getPatients(): Result<Vec<patientData>, string> {
    return Result.Ok(patientsStorage.values());
}

$query;
export function getPatient(id: string): Result<patientData, string> {
    return match(patientsStorage.get(id), {
        Some: (msg) => Result.Ok<patientData, string>(msg),
        None: () => Result.Err<patientData, string>(`Error!! Patient with id=${id} not found`)
    });
}

$update;
export function addPatient(payload: patientDataPayload): Result<patientData, string> {
    const pdata: patientData = { id: uuidv4(), createdOn: ic.time(), latUpdated: Opt.None, ...payload };
    patientsStorage.insert(pdata.id, pdata);
    return Result.Ok(pdata);
}

$update;
export function updatePatientData(id: string, payload: updatePatientFormat): Result<patientData, string> {
    return match(patientsStorage.get(id), {
        Some: (msg) => {
            const updatedMessage: patientData = {...msg, ...payload, latUpdated: Opt.Some(ic.time())};
            patientsStorage.insert(msg.id, updatedMessage);
            return Result.Ok<patientData, string>(updatedMessage);
        },
        None: () => Result.Err<patientData, string>(`Error!! Patient with id=${id} not found`)
    });
}

globalThis.crypto = {
     // @ts-ignore
    getRandomValues: () => {
        let array = new Uint8Array(32);
        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    }
};
