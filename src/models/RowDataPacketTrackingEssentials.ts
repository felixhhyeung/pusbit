import { RowDataPacket } from "mysql2";

export interface RowDataPacketTrackingEssentials extends RowDataPacket {
  creation_ts: EpochTimeStamp
  update_ts: EpochTimeStamp
}

export default RowDataPacketTrackingEssentials;
