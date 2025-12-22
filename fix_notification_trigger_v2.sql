-- FIX NOTIFICATION TRIGGER FOR MANUAL APPOINTMENTS
-- Problem: Manual appointments have NULL user_id, but the trigger tries to insert into 'notifications' which requires user_id.

-- 1. Update notify_new_appointment function
create or replace function public.notify_new_appointment()
returns trigger as $$
begin
  -- Only create notification if there is a valid user_id (Customer App)
  if new.user_id is not null then
    insert into public.notifications (user_id, title, message, type)
    values (
      new.user_id,
      'Agendamento Recebido',
      'Seu agendamento para ' || to_char(new.date, 'DD/MM') || ' às ' || new.time || ' foi recebido e está pendente.',
      'info'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- 2. Update notify_appointment_status function
create or replace function public.notify_appointment_status()
returns trigger as $$
begin
  -- Only create notification if there is a valid user_id
  if new.user_id is not null and old.status <> new.status then
    insert into public.notifications (user_id, title, message, type)
    values (
      new.user_id,
      'Status Atualizado',
      'Seu agendamento mudou para: ' || 
        case 
          when new.status = 'confirmed' then 'Confirmado ✅'
          when new.status = 'cancelled' then 'Cancelado ❌'
          else new.status
        end,
      case 
        when new.status = 'confirmed' then 'success'
        when new.status = 'cancelled' then 'warning'
        else 'info'
      end
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Reload configuration just in case
NOTIFY pgrst, 'reload config';
