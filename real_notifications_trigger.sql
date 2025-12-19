-- REAL AUTOMATED NOTIFICATIONS (TRIGGERS)

-- 1. Function to notify on NEW appointment
create or replace function public.notify_new_appointment()
returns trigger as $$
begin
  insert into public.notifications (user_id, title, message, type)
  values (
    new.user_id,
    'Agendamento Recebido',
    'Seu agendamento para ' || to_char(new.date, 'DD/MM') || ' às ' || new.time || ' foi recebido e está pendente.',
    'info'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Trigger for INSERT on appointments
drop trigger if exists on_appointment_created on public.appointments;
create trigger on_appointment_created
  after insert on public.appointments
  for each row execute procedure public.notify_new_appointment();


-- 3. Function to notify on STATUS CHANGE
create or replace function public.notify_appointment_status()
returns trigger as $$
begin
  if old.status <> new.status then
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

-- 4. Trigger for UPDATE on appointments
drop trigger if exists on_appointment_updated on public.appointments;
create trigger on_appointment_updated
  after update on public.appointments
  for each row execute procedure public.notify_appointment_status();
