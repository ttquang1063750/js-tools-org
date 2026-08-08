#!/bin/bash
# pg-lag.sh — measure the REAL replication lag, read from PostgreSQL itself (Lesson 7).
#
# Why not measure it by writing and then reading back: that gives you the lag *plus* the
# app's round-trip time, and it cannot separate the three different components of lag.
# PostgreSQL already exposes all three:
#
#   write_lag   time until the replica has WRITTEN the WAL to disk
#   flush_lag   time until the replica has FLUSHED it (durable)
#   replay_lag  time until the replica has APPLIED it — THIS is what a reader sees
#
# replay_lag is the number that matters for section 7.3: data that has reached the replica
# but has not been applied yet still makes SELECT return the old value.
set -u
cd "$(dirname "$0")/.."

echo "── On the PRIMARY: pg_stat_replication ──"
docker compose exec -T postgres psql -U lab -d lab -x -c "
  SELECT application_name,
         state,
         sync_state,
         pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), sent_lsn))   AS unsent,
         pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn)) AS unreplayed,
         COALESCE(write_lag::text,  '-') AS write_lag,
         COALESCE(flush_lag::text,  '-') AS flush_lag,
         COALESCE(replay_lag::text, '-') AS replay_lag
  FROM pg_stat_replication;" 2>/dev/null

echo "── On the REPLICA: which mode is it in, and how many seconds behind ──"
docker compose exec -T postgres-replica psql -U lab -d lab -x -c "
  SELECT pg_is_in_recovery() AS is_standby,
         -- With no write traffic this function grows steadily over time even though the
         -- replica has caught up perfectly — it measures 'how long since the last WAL
         -- record was replayed'. Do not alert on it while the system is idle.
         COALESCE(EXTRACT(EPOCH FROM now() - pg_last_xact_replay_timestamp())::numeric(10,3), 0)
           AS seconds_since_last_replayed_txn,
         pg_last_wal_receive_lsn() AS received_lsn,
         pg_last_wal_replay_lsn()  AS replayed_lsn;" 2>/dev/null
